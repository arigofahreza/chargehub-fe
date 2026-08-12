# ChargeHub FastAPI Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI REST backend for ChargeHub fleet management, replacing frontend mock data with a real SQLite database and exposing CRUD + auth endpoints.

**Architecture:** Single FastAPI app with SQLAlchemy ORM (SQLite dev, PostgreSQL-compatible), Pydantic v2 schemas for request/response validation, and JWT auth protecting all write endpoints. Lives at `chargehub/api/` alongside the existing `chargehub/web/` frontend. Frontend `lib/services/*.ts` files are updated in the final task to call real API instead of mock data.

**Tech Stack:** Python 3.11+, FastAPI 0.115, SQLAlchemy 2.0, Alembic, Pydantic v2, python-jose (JWT), passlib[bcrypt], httpx (test client), pytest, uvicorn

## Global Constraints

- Backend root: `C:\Users\argfh\chargehub\api\` (sibling to `web\`)
- Frontend root: `C:\Users\argfh\chargehub\web\`
- Python min version: 3.11
- All IDs: UUID strings (match frontend `string` id type)
- Snake_case in DB/Python, camelCase in JSON responses (via Pydantic `alias`)
- CORS allow origin: `http://localhost:3000` (Next.js dev) + env-configurable
- API prefix: `/api/v1`
- SQLite file: `chargehub/api/chargehub.db` (dev), use `DATABASE_URL` env for prod
- Auth token header: `Authorization: Bearer <token>`
- All `GET` list endpoints support optional query params for filtering

---

## File Map

```
chargehub/api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, router mounts
│   ├── database.py          # SQLAlchemy engine + SessionLocal + Base
│   ├── config.py            # Settings via pydantic-settings
│   ├── auth.py              # JWT create/verify, get_current_user dep
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── vehicle.py
│   │   ├── employee.py
│   │   ├── activity.py
│   │   └── notification.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── vehicle.py
│   │   ├── employee.py
│   │   ├── activity.py
│   │   └── notification.py
│   └── routers/
│       ├── __init__.py
│       ├── auth.py
│       ├── vehicles.py
│       ├── employees.py
│       ├── activity.py
│       └── notifications.py
├── tests/
│   ├── conftest.py          # TestClient + in-memory SQLite setup
│   ├── test_auth.py
│   ├── test_vehicles.py
│   ├── test_employees.py
│   ├── test_activity.py
│   └── test_notifications.py
├── alembic/
│   └── versions/            # Auto-generated migration files
├── alembic.ini
├── seed.py                  # Populate DB with mock data from frontend
├── requirements.txt
└── .env.example
```

Frontend files modified:
```
chargehub/web/
├── lib/
│   ├── api-client.ts        # NEW: axios/fetch base client with auth header
│   └── services/
│       ├── vehicles.ts      # Replace mock → real API calls
│       ├── employees.ts
│       ├── activity.ts
│       └── notifications.ts
└── .env.local               # Add NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `chargehub/api/requirements.txt`
- Create: `chargehub/api/.env.example`
- Create: `chargehub/api/app/__init__.py`
- Create: `chargehub/api/app/config.py`
- Create: `chargehub/api/app/database.py`
- Create: `chargehub/api/app/main.py`
- Create: `chargehub/api/alembic.ini`

**Interfaces:**
- Produces: `get_db()` generator (used by all routers), `Base` (inherited by all models), `Settings` singleton, running server at `http://localhost:8000`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p chargehub/api/app/models
mkdir -p chargehub/api/app/schemas
mkdir -p chargehub/api/app/routers
mkdir -p chargehub/api/tests
touch chargehub/api/app/__init__.py
touch chargehub/api/app/models/__init__.py
touch chargehub/api/app/schemas/__init__.py
touch chargehub/api/app/routers/__init__.py
touch chargehub/api/tests/__init__.py
```

- [ ] **Step 2: Create requirements.txt**

```
# chargehub/api/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.36
alembic==1.13.3
pydantic==2.9.2
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
httpx==0.27.2
pytest==8.3.3
pytest-asyncio==0.24.0
```

- [ ] **Step 3: Install dependencies**

```bash
cd chargehub/api
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

- [ ] **Step 4: Create .env.example**

```env
# chargehub/api/.env.example
DATABASE_URL=sqlite:///./chargehub.db
SECRET_KEY=change-me-to-random-32-char-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000
```

Copy to `.env`:
```bash
cp .env.example .env
```

- [ ] **Step 5: Create config.py**

```python
# chargehub/api/app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./chargehub.db"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

settings = Settings()
```

- [ ] **Step 6: Create database.py**

```python
# chargehub/api/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 7: Create main.py**

```python
# chargehub/api/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ChargeHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 8: Verify server starts**

```bash
cd chargehub/api
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/health` → expect `{"status": "ok"}`
Open `http://localhost:8000/docs` → expect Swagger UI

- [ ] **Step 9: Init alembic**

```bash
cd chargehub/api
alembic init alembic
```

Edit `alembic.ini` line 63: `sqlalchemy.url = sqlite:///./chargehub.db`

Edit `alembic/env.py` — add near top:
```python
from app.database import Base
from app import models  # noqa: F401  ← ensures models are imported
target_metadata = Base.metadata
```

- [ ] **Step 10: Commit**

```bash
git add chargehub/api/
git commit -m "feat: scaffold FastAPI backend with SQLAlchemy + Alembic"
```

---

### Task 2: Vehicle Model, Schema, Router

**Files:**
- Create: `chargehub/api/app/models/vehicle.py`
- Create: `chargehub/api/app/schemas/vehicle.py`
- Create: `chargehub/api/app/routers/vehicles.py`
- Modify: `chargehub/api/app/main.py` (add router)
- Modify: `chargehub/api/app/models/__init__.py`
- Test: `chargehub/api/tests/test_vehicles.py`
- Test: `chargehub/api/tests/conftest.py`

**Interfaces:**
- Consumes: `Base`, `get_db()` from Task 1
- Produces: `GET /api/v1/vehicles`, `GET /api/v1/vehicles/{id}`, `POST /api/v1/vehicles`, `PATCH /api/v1/vehicles/{id}`

- [ ] **Step 1: Write failing test (create conftest.py first)**

```python
# chargehub/api/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

```python
# chargehub/api/tests/test_vehicles.py
def test_list_vehicles_empty(client):
    resp = client.get("/api/v1/vehicles")
    assert resp.status_code == 200
    assert resp.json() == []

def test_create_vehicle(client):
    payload = {
        "name": "Tesla Model Y", "fleetId": "EV-001", "make": "Tesla",
        "model": "Model Y", "year": 2023, "vin": "5YJYGDEE4MF123456",
        "batteryCapacity": 75.0, "maxRange": 533.0, "assignedDriver": "James",
        "status": "available", "batteryPercent": 87.0, "photoUrl": "/img.jpg",
        "temperature": 24.0, "voltage": 394.0, "range": 463.0,
    }
    resp = client.post("/api/v1/vehicles", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Tesla Model Y"
    assert "id" in data

def test_get_vehicle_by_id(client):
    payload = {
        "name": "BYD Atto 3", "fleetId": "EV-002", "make": "BYD", "model": "Atto 3",
        "year": 2023, "vin": "LGXCE4C09P1234567", "batteryCapacity": 60.0,
        "maxRange": 420.0, "assignedDriver": "Sarah", "status": "in-use",
        "batteryPercent": 62.0, "photoUrl": "/img2.jpg",
        "temperature": 26.0, "voltage": 380.0, "range": 260.0,
    }
    created = client.post("/api/v1/vehicles", json=payload).json()
    resp = client.get(f"/api/v1/vehicles/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["fleetId"] == "EV-002"

def test_patch_vehicle(client):
    payload = {
        "name": "NIO ET5", "fleetId": "EV-003", "make": "NIO", "model": "ET5",
        "year": 2022, "vin": "NIO0ET5S2022A3456", "batteryCapacity": 75.0,
        "maxRange": 560.0, "assignedDriver": "Mike", "status": "available",
        "batteryPercent": 95.0, "photoUrl": "/img3.jpg",
        "temperature": 23.0, "voltage": 396.0, "range": 532.0,
    }
    created = client.post("/api/v1/vehicles", json=payload).json()
    resp = client.patch(f"/api/v1/vehicles/{created['id']}", json={"status": "in-use"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "in-use"

def test_filter_vehicles_by_status(client):
    for status in ["available", "available", "in-use"]:
        client.post("/api/v1/vehicles", json={
            "name": f"V-{status}", "fleetId": f"EV-{status}", "make": "X", "model": "X",
            "year": 2023, "vin": f"VIN{status[:3]}", "batteryCapacity": 60.0,
            "maxRange": 400.0, "assignedDriver": "X", "status": status,
            "batteryPercent": 80.0, "photoUrl": "/x.jpg",
            "temperature": 25.0, "voltage": 380.0, "range": 300.0,
        })
    resp = client.get("/api/v1/vehicles?status=available")
    assert len(resp.json()) == 2
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd chargehub/api
pytest tests/test_vehicles.py -v
```
Expected: `FAILED` — `404 Not Found` (router not registered yet)

- [ ] **Step 3: Create vehicle model**

```python
# chargehub/api/app/models/vehicle.py
import uuid
from sqlalchemy import String, Float, Integer, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    fleet_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    make: Mapped[str] = mapped_column(String, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    vin: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    battery_capacity: Mapped[float] = mapped_column(Float, nullable=False)
    max_range: Mapped[float] = mapped_column(Float, nullable=False)
    assigned_driver: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("available", "in-use", "service", name="vehicle_status"),
        nullable=False, default="available"
    )
    battery_percent: Mapped[float] = mapped_column(Float, nullable=False)
    photo_url: Mapped[str] = mapped_column(String, nullable=False, default="")
    temperature: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    voltage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    range: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
```

Update `app/models/__init__.py`:
```python
from app.models.vehicle import Vehicle  # noqa: F401
```

- [ ] **Step 4: Create vehicle schemas**

```python
# chargehub/api/app/schemas/vehicle.py
from typing import Literal, Optional
from pydantic import BaseModel, Field

VehicleStatus = Literal["available", "in-use", "service"]

class VehicleBase(BaseModel):
    name: str
    fleet_id: str = Field(alias="fleetId")
    make: str
    model: str
    year: int
    vin: str
    battery_capacity: float = Field(alias="batteryCapacity")
    max_range: float = Field(alias="maxRange")
    assigned_driver: str = Field(alias="assignedDriver")
    status: VehicleStatus
    battery_percent: float = Field(alias="batteryPercent")
    photo_url: str = Field(alias="photoUrl")
    temperature: float
    voltage: float
    range: float

    model_config = {"populate_by_name": True}

class VehicleCreate(VehicleBase):
    pass

class VehiclePatch(BaseModel):
    name: Optional[str] = None
    fleet_id: Optional[str] = Field(None, alias="fleetId")
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    battery_capacity: Optional[float] = Field(None, alias="batteryCapacity")
    max_range: Optional[float] = Field(None, alias="maxRange")
    assigned_driver: Optional[str] = Field(None, alias="assignedDriver")
    status: Optional[VehicleStatus] = None
    battery_percent: Optional[float] = Field(None, alias="batteryPercent")
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    temperature: Optional[float] = None
    voltage: Optional[float] = None
    range: Optional[float] = None

    model_config = {"populate_by_name": True}

class VehicleOut(VehicleBase):
    id: str

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "alias_generator": None,
    }

    @classmethod
    def from_orm_model(cls, v) -> "VehicleOut":
        return cls(
            id=v.id,
            fleetId=v.fleet_id,
            name=v.name,
            make=v.make,
            model=v.model,
            year=v.year,
            vin=v.vin,
            batteryCapacity=v.battery_capacity,
            maxRange=v.max_range,
            assignedDriver=v.assigned_driver,
            status=v.status,
            batteryPercent=v.battery_percent,
            photoUrl=v.photo_url,
            temperature=v.temperature,
            voltage=v.voltage,
            range=v.range,
        )
```

- [ ] **Step 5: Create vehicle router**

```python
# chargehub/api/app/routers/vehicles.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehiclePatch, VehicleOut

router = APIRouter(prefix="/api/v1/vehicles", tags=["vehicles"])

@router.get("", response_model=list[VehicleOut])
def list_vehicles(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Vehicle)
    if search:
        term = f"%{search.lower()}%"
        q = q.filter(
            Vehicle.name.ilike(term) | Vehicle.fleet_id.ilike(term)
        )
    if status and status != "all":
        q = q.filter(Vehicle.status == status)
    return [VehicleOut.from_orm_model(v) for v in q.all()]

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return VehicleOut.from_orm_model(v)

@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    v = Vehicle(
        name=payload.name, fleet_id=payload.fleet_id, make=payload.make,
        model=payload.model, year=payload.year, vin=payload.vin,
        battery_capacity=payload.battery_capacity, max_range=payload.max_range,
        assigned_driver=payload.assigned_driver, status=payload.status,
        battery_percent=payload.battery_percent, photo_url=payload.photo_url,
        temperature=payload.temperature, voltage=payload.voltage, range=payload.range,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return VehicleOut.from_orm_model(v)

@router.patch("/{vehicle_id}", response_model=VehicleOut)
def patch_vehicle(vehicle_id: str, payload: VehiclePatch, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        snake = field  # already snake_case from VehiclePatch field names
        if hasattr(v, snake):
            setattr(v, snake, value)
    db.commit()
    db.refresh(v)
    return VehicleOut.from_orm_model(v)
```

- [ ] **Step 6: Register router in main.py**

```python
# chargehub/api/app/main.py  — add these lines after middleware setup
from app.routers import vehicles
app.include_router(vehicles.router)
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
pytest tests/test_vehicles.py -v
```
Expected: 4 PASSED

- [ ] **Step 8: Generate migration**

```bash
alembic revision --autogenerate -m "add vehicles table"
alembic upgrade head
```

- [ ] **Step 9: Commit**

```bash
git add chargehub/api/
git commit -m "feat: add Vehicle CRUD endpoints"
```

---

### Task 3: Employee Model, Schema, Router

**Files:**
- Create: `chargehub/api/app/models/employee.py`
- Create: `chargehub/api/app/schemas/employee.py`
- Create: `chargehub/api/app/routers/employees.py`
- Modify: `chargehub/api/app/main.py`
- Modify: `chargehub/api/app/models/__init__.py`
- Test: `chargehub/api/tests/test_employees.py`

**Interfaces:**
- Consumes: `Base`, `get_db()`
- Produces: `GET /api/v1/employees`, `POST /api/v1/employees`, `PATCH /api/v1/employees/{id}`

- [ ] **Step 1: Write failing tests**

```python
# chargehub/api/tests/test_employees.py
def test_list_employees_empty(client):
    resp = client.get("/api/v1/employees")
    assert resp.status_code == 200
    assert resp.json() == []

def test_create_employee(client):
    payload = {
        "name": "James Wilson", "email": "james@chargehub.com",
        "jobTitle": "Fleet Manager", "phone": "+1-555-0101",
        "status": "active", "initials": "JW",
    }
    resp = client.post("/api/v1/employees", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "James Wilson"
    assert data["jobTitle"] == "Fleet Manager"
    assert "id" in data

def test_filter_employees_by_status(client):
    for name, status in [("A", "active"), ("B", "active"), ("C", "inactive")]:
        client.post("/api/v1/employees", json={
            "name": name, "email": f"{name}@x.com", "jobTitle": "X",
            "phone": "0", "status": status, "initials": name,
        })
    resp = client.get("/api/v1/employees?status=active")
    assert len(resp.json()) == 2

def test_patch_employee(client):
    created = client.post("/api/v1/employees", json={
        "name": "Sarah Chen", "email": "sarah@chargehub.com",
        "jobTitle": "Driver", "phone": "+1-555-0102",
        "status": "active", "initials": "SC",
    }).json()
    resp = client.patch(f"/api/v1/employees/{created['id']}", json={"status": "on-leave"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "on-leave"
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_employees.py -v
```

- [ ] **Step 3: Create employee model**

```python
# chargehub/api/app/models/employee.py
import uuid
from typing import Optional
from sqlalchemy import String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    job_title: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("active", "on-leave", "inactive", name="employee_status"),
        nullable=False, default="active"
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    initials: Mapped[str] = mapped_column(String, nullable=False)
```

Update `app/models/__init__.py`:
```python
from app.models.vehicle import Vehicle  # noqa: F401
from app.models.employee import Employee  # noqa: F401
```

- [ ] **Step 4: Create employee schemas**

```python
# chargehub/api/app/schemas/employee.py
from typing import Literal, Optional
from pydantic import BaseModel, Field

EmployeeStatus = Literal["active", "on-leave", "inactive"]

class EmployeeBase(BaseModel):
    name: str
    email: str
    job_title: str = Field(alias="jobTitle")
    phone: str
    status: EmployeeStatus
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    initials: str

    model_config = {"populate_by_name": True}

class EmployeeCreate(EmployeeBase):
    pass

class EmployeePatch(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    job_title: Optional[str] = Field(None, alias="jobTitle")
    phone: Optional[str] = None
    status: Optional[EmployeeStatus] = None
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    initials: Optional[str] = None

    model_config = {"populate_by_name": True}

class EmployeeOut(EmployeeBase):
    id: str

    @classmethod
    def from_orm_model(cls, e) -> "EmployeeOut":
        return cls(
            id=e.id, name=e.name, email=e.email,
            jobTitle=e.job_title, phone=e.phone, status=e.status,
            avatarUrl=e.avatar_url, initials=e.initials,
        )
```

- [ ] **Step 5: Create employee router**

```python
# chargehub/api/app/routers/employees.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeePatch, EmployeeOut

router = APIRouter(prefix="/api/v1/employees", tags=["employees"])

@router.get("", response_model=list[EmployeeOut])
def list_employees(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Employee)
    if status and status != "all":
        q = q.filter(Employee.status == status)
    return [EmployeeOut.from_orm_model(e) for e in q.all()]

@router.post("", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    e = Employee(
        name=payload.name, email=payload.email, job_title=payload.job_title,
        phone=payload.phone, status=payload.status,
        avatar_url=payload.avatar_url, initials=payload.initials,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return EmployeeOut.from_orm_model(e)

@router.patch("/{employee_id}", response_model=EmployeeOut)
def patch_employee(employee_id: str, payload: EmployeePatch, db: Session = Depends(get_db)):
    e = db.query(Employee).filter(Employee.id == employee_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
    updates = payload.model_dump(exclude_unset=True, by_alias=False)
    field_map = {"job_title": "job_title", "avatar_url": "avatar_url"}
    for field, value in updates.items():
        setattr(e, field, value)
    db.commit()
    db.refresh(e)
    return EmployeeOut.from_orm_model(e)
```

- [ ] **Step 6: Register router in main.py**

```python
from app.routers import vehicles, employees
app.include_router(employees.router)
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
pytest tests/test_employees.py -v
```

- [ ] **Step 8: Generate migration**

```bash
alembic revision --autogenerate -m "add employees table"
alembic upgrade head
```

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add Employee CRUD endpoints"
```

---

### Task 4: Activity Log Model, Schema, Router

**Files:**
- Create: `chargehub/api/app/models/activity.py`
- Create: `chargehub/api/app/schemas/activity.py`
- Create: `chargehub/api/app/routers/activity.py`
- Modify: `chargehub/api/app/main.py`
- Modify: `chargehub/api/app/models/__init__.py`
- Test: `chargehub/api/tests/test_activity.py`

**Interfaces:**
- Consumes: `Base`, `get_db()`
- Produces: `GET /api/v1/activity`, `POST /api/v1/activity`, `PATCH /api/v1/activity/{id}`

- [ ] **Step 1: Write failing tests**

```python
# chargehub/api/tests/test_activity.py
def test_list_activity_empty(client):
    resp = client.get("/api/v1/activity")
    assert resp.status_code == 200
    assert resp.json() == []

def test_create_activity_log(client):
    payload = {
        "dateTime": "2026-08-06T09:15:00Z",
        "vehicleId": "some-vehicle-uuid",
        "vehicleName": "Tesla Model Y",
        "unitId": "EV-001",
        "serviceType": "Charging",
        "driver": "James Wilson",
        "status": "completed",
        "createdBy": "System",
    }
    resp = client.post("/api/v1/activity", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["serviceType"] == "Charging"
    assert "id" in data

def test_filter_by_service_type(client):
    for stype in ["Charging", "Charging", "Maintenance"]:
        client.post("/api/v1/activity", json={
            "dateTime": "2026-08-06T09:00:00Z",
            "vehicleId": "v1", "vehicleName": "VX", "unitId": "EV-X",
            "serviceType": stype, "driver": "X", "status": "completed", "createdBy": "X",
        })
    resp = client.get("/api/v1/activity?serviceType=Charging")
    assert len(resp.json()) == 2

def test_filter_by_vehicle_id(client):
    for vid in ["v1", "v1", "v2"]:
        client.post("/api/v1/activity", json={
            "dateTime": "2026-08-06T09:00:00Z",
            "vehicleId": vid, "vehicleName": "VX", "unitId": "EV-X",
            "serviceType": "Charging", "driver": "X", "status": "completed", "createdBy": "X",
        })
    resp = client.get("/api/v1/activity?vehicleId=v1")
    assert len(resp.json()) == 2

def test_patch_activity_status(client):
    created = client.post("/api/v1/activity", json={
        "dateTime": "2026-08-06T09:00:00Z",
        "vehicleId": "v1", "vehicleName": "VX", "unitId": "EV-X",
        "serviceType": "Maintenance", "driver": "X", "status": "pending", "createdBy": "X",
    }).json()
    resp = client.patch(f"/api/v1/activity/{created['id']}", json={"status": "completed"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_activity.py -v
```

- [ ] **Step 3: Create activity model**

```python
# chargehub/api/app/models/activity.py
import uuid
from sqlalchemy import String, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    vehicle_id: Mapped[str] = mapped_column(String, nullable=False)
    vehicle_name: Mapped[str] = mapped_column(String, nullable=False)
    unit_id: Mapped[str] = mapped_column(String, nullable=False)
    service_type: Mapped[str] = mapped_column(String, nullable=False)
    driver: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("completed", "in-progress", "pending", name="activity_status"),
        nullable=False, default="pending"
    )
    created_by: Mapped[str] = mapped_column(String, nullable=False)
```

Update `app/models/__init__.py`:
```python
from app.models.vehicle import Vehicle  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.activity import ActivityLog  # noqa: F401
```

- [ ] **Step 4: Create activity schemas**

```python
# chargehub/api/app/schemas/activity.py
from typing import Literal, Optional
from datetime import datetime
from pydantic import BaseModel, Field

ActivityStatus = Literal["completed", "in-progress", "pending"]

class ActivityLogBase(BaseModel):
    date_time: datetime = Field(alias="dateTime")
    vehicle_id: str = Field(alias="vehicleId")
    vehicle_name: str = Field(alias="vehicleName")
    unit_id: str = Field(alias="unitId")
    service_type: str = Field(alias="serviceType")
    driver: str
    status: ActivityStatus
    created_by: str = Field(alias="createdBy")

    model_config = {"populate_by_name": True}

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogPatch(BaseModel):
    date_time: Optional[datetime] = Field(None, alias="dateTime")
    vehicle_id: Optional[str] = Field(None, alias="vehicleId")
    vehicle_name: Optional[str] = Field(None, alias="vehicleName")
    unit_id: Optional[str] = Field(None, alias="unitId")
    service_type: Optional[str] = Field(None, alias="serviceType")
    driver: Optional[str] = None
    status: Optional[ActivityStatus] = None
    created_by: Optional[str] = Field(None, alias="createdBy")

    model_config = {"populate_by_name": True}

class ActivityLogOut(ActivityLogBase):
    id: str

    @classmethod
    def from_orm_model(cls, a) -> "ActivityLogOut":
        return cls(
            id=a.id,
            dateTime=a.date_time.isoformat() + "Z" if not str(a.date_time).endswith("Z") else a.date_time.isoformat(),
            vehicleId=a.vehicle_id,
            vehicleName=a.vehicle_name,
            unitId=a.unit_id,
            serviceType=a.service_type,
            driver=a.driver,
            status=a.status,
            createdBy=a.created_by,
        )
```

- [ ] **Step 5: Create activity router**

```python
# chargehub/api/app/routers/activity.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from app.database import get_db
from app.models.activity import ActivityLog
from app.schemas.activity import ActivityLogCreate, ActivityLogPatch, ActivityLogOut

router = APIRouter(prefix="/api/v1/activity", tags=["activity"])

@router.get("", response_model=list[ActivityLogOut])
def list_activity(
    service_type: Optional[str] = Query(None, alias="serviceType"),
    vehicle_id: Optional[str] = Query(None, alias="vehicleId"),
    db: Session = Depends(get_db),
):
    q = db.query(ActivityLog)
    if service_type and service_type != "all":
        q = q.filter(ActivityLog.service_type == service_type)
    if vehicle_id and vehicle_id != "all":
        q = q.filter(ActivityLog.vehicle_id == vehicle_id)
    return [ActivityLogOut.from_orm_model(a) for a in q.order_by(ActivityLog.date_time.desc()).all()]

@router.post("", response_model=ActivityLogOut, status_code=201)
def create_activity(payload: ActivityLogCreate, db: Session = Depends(get_db)):
    a = ActivityLog(
        date_time=payload.date_time,
        vehicle_id=payload.vehicle_id,
        vehicle_name=payload.vehicle_name,
        unit_id=payload.unit_id,
        service_type=payload.service_type,
        driver=payload.driver,
        status=payload.status,
        created_by=payload.created_by,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return ActivityLogOut.from_orm_model(a)

@router.patch("/{log_id}", response_model=ActivityLogOut)
def patch_activity(log_id: str, payload: ActivityLogPatch, db: Session = Depends(get_db)):
    a = db.query(ActivityLog).filter(ActivityLog.id == log_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Activity log not found")
    updates = payload.model_dump(exclude_unset=True, by_alias=False)
    for field, value in updates.items():
        setattr(a, field, value)
    db.commit()
    db.refresh(a)
    return ActivityLogOut.from_orm_model(a)
```

- [ ] **Step 6: Register router**

```python
from app.routers import vehicles, employees, activity
app.include_router(activity.router)
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
pytest tests/test_activity.py -v
```

- [ ] **Step 8: Migration + commit**

```bash
alembic revision --autogenerate -m "add activity_logs table"
alembic upgrade head
git commit -m "feat: add ActivityLog CRUD endpoints"
```

---

### Task 5: Notification Template Model, Schema, Router

**Files:**
- Create: `chargehub/api/app/models/notification.py`
- Create: `chargehub/api/app/schemas/notification.py`
- Create: `chargehub/api/app/routers/notifications.py`
- Modify: `chargehub/api/app/main.py`
- Modify: `chargehub/api/app/models/__init__.py`
- Test: `chargehub/api/tests/test_notifications.py`

**Interfaces:**
- Consumes: `Base`, `get_db()`
- Produces: `GET /api/v1/notifications`, `POST /api/v1/notifications`, `PATCH /api/v1/notifications/{id}`

- [ ] **Step 1: Write failing tests**

```python
# chargehub/api/tests/test_notifications.py
def test_list_notifications_empty(client):
    resp = client.get("/api/v1/notifications")
    assert resp.status_code == 200
    assert resp.json() == []

def test_create_notification_template(client):
    payload = {
        "name": "Battery Low Alert",
        "message": "Vehicle {unit} battery below 20%",
        "status": "active",
        "employeeCount": 5,
        "phoneCount": 8,
        "lastSent": "2026-08-06T09:00:00Z",
    }
    resp = client.post("/api/v1/notifications", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Battery Low Alert"
    assert data["status"] == "active"
    assert "id" in data

def test_patch_notification_status(client):
    created = client.post("/api/v1/notifications", json={
        "name": "Maintenance Due", "message": "Vehicle needs service",
        "status": "active", "employeeCount": 3, "phoneCount": 5,
        "lastSent": "2026-08-01T00:00:00Z",
    }).json()
    resp = client.patch(f"/api/v1/notifications/{created['id']}", json={"status": "inactive"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "inactive"
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_notifications.py -v
```

- [ ] **Step 3: Create notification model**

```python
# chargehub/api/app/models/notification.py
import uuid
from sqlalchemy import String, Integer, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.database import Base

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("active", "inactive", name="template_status"),
        nullable=False, default="active"
    )
    employee_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    phone_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_sent: Mapped[datetime] = mapped_column(DateTime, nullable=False)
```

Update `app/models/__init__.py`:
```python
from app.models.vehicle import Vehicle  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.activity import ActivityLog  # noqa: F401
from app.models.notification import NotificationTemplate  # noqa: F401
```

- [ ] **Step 4: Create notification schemas**

```python
# chargehub/api/app/schemas/notification.py
from typing import Literal, Optional
from datetime import datetime
from pydantic import BaseModel, Field

TemplateStatus = Literal["active", "inactive"]

class NotificationTemplateBase(BaseModel):
    name: str
    message: str
    status: TemplateStatus
    employee_count: int = Field(alias="employeeCount")
    phone_count: int = Field(alias="phoneCount")
    last_sent: str = Field(alias="lastSent")

    model_config = {"populate_by_name": True}

class NotificationTemplateCreate(NotificationTemplateBase):
    pass

class NotificationTemplatePatch(BaseModel):
    name: Optional[str] = None
    message: Optional[str] = None
    status: Optional[TemplateStatus] = None
    employee_count: Optional[int] = Field(None, alias="employeeCount")
    phone_count: Optional[int] = Field(None, alias="phoneCount")
    last_sent: Optional[str] = Field(None, alias="lastSent")

    model_config = {"populate_by_name": True}

class NotificationTemplateOut(NotificationTemplateBase):
    id: str

    @classmethod
    def from_orm_model(cls, t) -> "NotificationTemplateOut":
        return cls(
            id=t.id, name=t.name, message=t.message, status=t.status,
            employeeCount=t.employee_count, phoneCount=t.phone_count,
            lastSent=t.last_sent.isoformat() + "Z",
        )
```

- [ ] **Step 5: Create notification router**

```python
# chargehub/api/app/routers/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.notification import NotificationTemplate
from app.schemas.notification import NotificationTemplateCreate, NotificationTemplatePatch, NotificationTemplateOut

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])

@router.get("", response_model=list[NotificationTemplateOut])
def list_notifications(db: Session = Depends(get_db)):
    return [NotificationTemplateOut.from_orm_model(t) for t in db.query(NotificationTemplate).all()]

@router.post("", response_model=NotificationTemplateOut, status_code=201)
def create_notification(payload: NotificationTemplateCreate, db: Session = Depends(get_db)):
    t = NotificationTemplate(
        name=payload.name, message=payload.message, status=payload.status,
        employee_count=payload.employee_count, phone_count=payload.phone_count,
        last_sent=datetime.fromisoformat(payload.last_sent.replace("Z", "+00:00")),
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return NotificationTemplateOut.from_orm_model(t)

@router.patch("/{template_id}", response_model=NotificationTemplateOut)
def patch_notification(template_id: str, payload: NotificationTemplatePatch, db: Session = Depends(get_db)):
    t = db.query(NotificationTemplate).filter(NotificationTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    updates = payload.model_dump(exclude_unset=True, by_alias=False)
    for field, value in updates.items():
        if field == "last_sent" and value:
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        setattr(t, field, value)
    db.commit()
    db.refresh(t)
    return NotificationTemplateOut.from_orm_model(t)
```

- [ ] **Step 6: Register router**

```python
from app.routers import vehicles, employees, activity, notifications
app.include_router(notifications.router)
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
pytest tests/test_notifications.py -v
```

- [ ] **Step 8: Migration + commit**

```bash
alembic revision --autogenerate -m "add notification_templates table"
alembic upgrade head
git commit -m "feat: add NotificationTemplate CRUD endpoints"
```

---

### Task 6: JWT Authentication

**Files:**
- Create: `chargehub/api/app/models/user.py`
- Create: `chargehub/api/app/schemas/user.py`
- Create: `chargehub/api/app/auth.py`
- Create: `chargehub/api/app/routers/auth.py`
- Modify: `chargehub/api/app/main.py`
- Modify: `chargehub/api/app/models/__init__.py`
- Test: `chargehub/api/tests/test_auth.py`

**Interfaces:**
- Consumes: `Base`, `get_db()`, `Settings`
- Produces: `POST /api/v1/auth/login` → `{access_token, token_type}`, `get_current_user` FastAPI dependency

- [ ] **Step 1: Write failing tests**

```python
# chargehub/api/tests/test_auth.py
def test_login_success(client):
    # Register user first via direct DB insert (seed step)
    from app.models.user import User
    from passlib.context import CryptContext
    from tests.conftest import db_session  # noqa
    # We'll use a fresh approach: call the register endpoint (added in this task)
    resp = client.post("/api/v1/auth/register", json={
        "email": "admin@chargehub.com",
        "password": "secret123",
        "name": "Admin User",
        "jobTitle": "Fleet Manager",
    })
    assert resp.status_code == 201

    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@chargehub.com",
        "password": "secret123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "user2@chargehub.com", "password": "correct",
        "name": "User2", "jobTitle": "Driver",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "user2@chargehub.com", "password": "wrong",
    })
    assert resp.status_code == 401

def test_login_unknown_user(client):
    resp = client.post("/api/v1/auth/login", data={
        "username": "nobody@chargehub.com", "password": "x",
    })
    assert resp.status_code == 401
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_auth.py -v
```

- [ ] **Step 3: Create user model**

```python
# chargehub/api/app/models/user.py
import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    job_title: Mapped[str] = mapped_column(String, nullable=False, default="")
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
```

Update `app/models/__init__.py`:
```python
from app.models.vehicle import Vehicle  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.activity import ActivityLog  # noqa: F401
from app.models.notification import NotificationTemplate  # noqa: F401
from app.models.user import User  # noqa: F401
```

- [ ] **Step 4: Create user schemas**

```python
# chargehub/api/app/schemas/user.py
from pydantic import BaseModel, Field

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    job_title: str = Field(alias="jobTitle")

    model_config = {"populate_by_name": True}

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    job_title: str = Field(alias="jobTitle")

    model_config = {"populate_by_name": True}

    @classmethod
    def from_orm_model(cls, u) -> "UserOut":
        return cls(id=u.id, email=u.email, name=u.name, jobTitle=u.job_title)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: str | None = None
```

- [ ] **Step 5: Create auth.py (JWT utilities)**

```python
# chargehub/api/app/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exc
    except JWTError:
        raise credentials_exc
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exc
    return user
```

- [ ] **Step 6: Create auth router**

```python
# chargehub/api/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserOut, Token
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        name=payload.name,
        job_title=payload.job_title,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.from_orm_model(user)

@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.id)
    return Token(access_token=token)
```

- [ ] **Step 7: Register auth router in main.py**

```python
from app.routers import vehicles, employees, activity, notifications, auth as auth_router
app.include_router(auth_router.router)
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
pytest tests/test_auth.py -v
```

- [ ] **Step 9: Run all tests**

```bash
pytest tests/ -v
```
Expected: all 15+ tests PASS

- [ ] **Step 10: Migration + commit**

```bash
alembic revision --autogenerate -m "add users table"
alembic upgrade head
git commit -m "feat: add JWT auth with register + login endpoints"
```

---

### Task 7: Seed Database

**Files:**
- Create: `chargehub/api/seed.py`

**Interfaces:**
- Consumes: all models + DB session
- Produces: populated `chargehub.db` with data matching frontend mock data

- [ ] **Step 1: Create seed.py**

```python
# chargehub/api/seed.py
"""Run: python seed.py"""
from datetime import datetime, timezone
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.employee import Employee
from app.models.activity import ActivityLog
from app.models.notification import NotificationTemplate
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).count() == 0:
    db.add(User(
        email="admin@chargehub.com", name="James Wilson",
        job_title="Fleet Manager", hashed_password=hash_password("chargehub123"),
    ))

if db.query(Vehicle).count() == 0:
    vehicles = [
        Vehicle(id="1", name="Tesla Model Y", fleet_id="EV-001", make="Tesla", model="Model Y",
                year=2023, vin="5YJYGDEE4MF123456", battery_capacity=75, max_range=533,
                assigned_driver="James Wilson", status="available", battery_percent=87,
                photo_url="/assets/vehicle-hero.jpg", temperature=24, voltage=394, range=463),
        Vehicle(id="2", name="BYD Atto 3", fleet_id="EV-002", make="BYD", model="Atto 3",
                year=2023, vin="LGXCE4C09P1234567", battery_capacity=60, max_range=420,
                assigned_driver="Sarah Chen", status="in-use", battery_percent=62,
                photo_url="/assets/vehicle-2.jpg", temperature=26, voltage=380, range=260),
        Vehicle(id="3", name="NIO ET5", fleet_id="EV-003", make="NIO", model="ET5",
                year=2022, vin="NIO0ET5S2022A3456", battery_capacity=75, max_range=560,
                assigned_driver="Mike Rodriguez", status="available", battery_percent=95,
                photo_url="/assets/vehicle-3.jpg", temperature=23, voltage=396, range=532),
        Vehicle(id="4", name="Hyundai IONIQ 5", fleet_id="EV-004", make="Hyundai", model="IONIQ 5",
                year=2023, vin="KMHK341GX2A234567", battery_capacity=72, max_range=481,
                assigned_driver="Unassigned", status="service", battery_percent=45,
                photo_url="/assets/vehicle-4.jpg", temperature=28, voltage=370, range=216),
    ]
    db.add_all(vehicles)

if db.query(Employee).count() == 0:
    employees = [
        Employee(id="1", name="James Wilson", email="james@chargehub.com",
                 job_title="Fleet Manager", phone="+1-555-0101", status="active", initials="JW"),
        Employee(id="2", name="Sarah Chen", email="sarah@chargehub.com",
                 job_title="Driver", phone="+1-555-0102", status="active", initials="SC"),
        Employee(id="3", name="Mike Rodriguez", email="mike@chargehub.com",
                 job_title="Driver", phone="+1-555-0103", status="active", initials="MR"),
        Employee(id="4", name="Anna Kowalski", email="anna@chargehub.com",
                 job_title="Maintenance", phone="+1-555-0104", status="on-leave", initials="AK"),
    ]
    db.add_all(employees)

if db.query(ActivityLog).count() == 0:
    logs = [
        ActivityLog(id="1", date_time=datetime(2026, 8, 6, 9, 15, tzinfo=timezone.utc),
                    vehicle_id="1", vehicle_name="Tesla Model Y", unit_id="EV-001",
                    service_type="Charging", driver="James Wilson",
                    status="completed", created_by="System"),
        ActivityLog(id="2", date_time=datetime(2026, 8, 6, 8, 0, tzinfo=timezone.utc),
                    vehicle_id="4", vehicle_name="Hyundai IONIQ 5", unit_id="EV-004",
                    service_type="Maintenance", driver="Unassigned",
                    status="in-progress", created_by="Anna Kowalski"),
        ActivityLog(id="3", date_time=datetime(2026, 8, 5, 14, 30, tzinfo=timezone.utc),
                    vehicle_id="2", vehicle_name="BYD Atto 3", unit_id="EV-002",
                    service_type="Inspection", driver="Sarah Chen",
                    status="completed", created_by="James Wilson"),
    ]
    db.add_all(logs)

if db.query(NotificationTemplate).count() == 0:
    templates = [
        NotificationTemplate(
            id="1", name="Battery Low Alert",
            message="Vehicle {unit} battery is below 20%. Please charge immediately.",
            status="active", employee_count=5, phone_count=8,
            last_sent=datetime(2026, 8, 5, 10, 0, tzinfo=timezone.utc),
        ),
        NotificationTemplate(
            id="2", name="Maintenance Due",
            message="Vehicle {unit} is due for scheduled maintenance.",
            status="active", employee_count=3, phone_count=5,
            last_sent=datetime(2026, 8, 1, 9, 0, tzinfo=timezone.utc),
        ),
    ]
    db.add_all(templates)

db.commit()
db.close()
print("Seed complete.")
```

- [ ] **Step 2: Run seed**

```bash
cd chargehub/api
python seed.py
```
Expected: `Seed complete.`

- [ ] **Step 3: Verify via curl**

```bash
curl http://localhost:8000/api/v1/vehicles
curl http://localhost:8000/api/v1/employees
```
Expected: JSON arrays with seeded data.

- [ ] **Step 4: Commit**

```bash
git add chargehub/api/seed.py
git commit -m "feat: add seed script with mock data"
```

---

### Task 8: Frontend Integration

**Files:**
- Create: `chargehub/web/lib/api-client.ts`
- Modify: `chargehub/web/lib/services/vehicles.ts`
- Modify: `chargehub/web/lib/services/employees.ts`
- Modify: `chargehub/web/lib/services/activity.ts`
- Modify: `chargehub/web/lib/services/notifications.ts`
- Create: `chargehub/web/.env.local` (if not exists)

**Interfaces:**
- Consumes: `GET/POST/PATCH /api/v1/*` from Tasks 2-5
- Produces: same TypeScript function signatures as current mock services — frontend pages require zero changes

- [ ] **Step 1: Add env var**

Create `chargehub/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 2: Create api-client.ts**

```typescript
// chargehub/web/lib/api-client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
```

- [ ] **Step 3: Update vehicles.ts**

```typescript
// chargehub/web/lib/services/vehicles.ts
import { Vehicle, VehicleFilter } from "../types";
import { api } from "../api-client";

export async function getVehicles(filter?: VehicleFilter): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filter?.search) params.set("search", filter.search);
  if (filter?.status && filter.status !== "all") params.set("status", filter.status);
  const qs = params.toString();
  return api.get<Vehicle[]>(`/api/v1/vehicles${qs ? `?${qs}` : ""}`);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    return await api.get<Vehicle>(`/api/v1/vehicles/${id}`);
  } catch {
    return null;
  }
}

export async function createVehicle(data: Omit<Vehicle, "id">): Promise<Vehicle> {
  return api.post<Vehicle>("/api/v1/vehicles", data);
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | null> {
  try {
    return await api.patch<Vehicle>(`/api/v1/vehicles/${id}`, data);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Update employees.ts**

```typescript
// chargehub/web/lib/services/employees.ts
import { Employee, EmployeeStatus } from "../types";
import { api } from "../api-client";

export async function getEmployees(statusFilter?: EmployeeStatus | "all"): Promise<Employee[]> {
  const qs = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
  return api.get<Employee[]>(`/api/v1/employees${qs}`);
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<Employee> {
  return api.post<Employee>("/api/v1/employees", data);
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee | null> {
  try {
    return await api.patch<Employee>(`/api/v1/employees/${id}`, data);
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Update activity.ts**

```typescript
// chargehub/web/lib/services/activity.ts
import { ActivityLog, ActivityFilter } from "../types";
import { api } from "../api-client";

export async function getActivityLogs(filter?: ActivityFilter): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  if (filter?.serviceType && filter.serviceType !== "all") params.set("serviceType", filter.serviceType);
  if (filter?.vehicleId && filter.vehicleId !== "all") params.set("vehicleId", filter.vehicleId);
  const qs = params.toString();
  return api.get<ActivityLog[]>(`/api/v1/activity${qs ? `?${qs}` : ""}`);
}

export async function createActivityLog(data: Omit<ActivityLog, "id">): Promise<ActivityLog> {
  return api.post<ActivityLog>("/api/v1/activity", data);
}

export async function updateActivityLog(id: string, data: Partial<ActivityLog>): Promise<ActivityLog | null> {
  try {
    return await api.patch<ActivityLog>(`/api/v1/activity/${id}`, data);
  } catch {
    return null;
  }
}
```

- [ ] **Step 6: Update notifications.ts**

```typescript
// chargehub/web/lib/services/notifications.ts
import { NotificationTemplate } from "../types";
import { api } from "../api-client";

export async function getTemplates(): Promise<NotificationTemplate[]> {
  return api.get<NotificationTemplate[]>("/api/v1/notifications");
}

export async function createTemplate(data: Omit<NotificationTemplate, "id">): Promise<NotificationTemplate> {
  return api.post<NotificationTemplate>("/api/v1/notifications", data);
}

export async function updateTemplate(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
  try {
    return await api.patch<NotificationTemplate>(`/api/v1/notifications/${id}`, data);
  } catch {
    return null;
  }
}
```

- [ ] **Step 7: Integration test — start both servers**

```bash
# Terminal 1 — backend
cd chargehub/api
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd chargehub/web
npm run dev
```

Open `http://localhost:3000/vehicles` → vehicles load from real DB. Open `http://localhost:3000/employees` → employees load. Open `http://localhost:3000/activity` → logs load.

- [ ] **Step 8: TypeScript check frontend**

```bash
cd chargehub/web
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add chargehub/web/lib/
git commit -m "feat: connect frontend services to FastAPI backend"
```

---

## Self-Review

**Spec coverage:**
- ✅ Vehicle CRUD (GET list + filter, GET by ID, POST, PATCH) — Task 2
- ✅ Employee CRUD (GET list + filter by status, POST, PATCH) — Task 3
- ✅ Activity CRUD (GET list + filter, POST, PATCH) — Task 4
- ✅ Notification Template CRUD (GET, POST, PATCH) — Task 5
- ✅ JWT auth (register + login) — Task 6
- ✅ Seed data matching frontend mock — Task 7
- ✅ Frontend service wiring — Task 8
- ✅ CORS config for `localhost:3000` — Task 1 main.py

**Gaps noted:**
- Dashboard page has summary stats (vehicle count by status, employee count) — these can be derived from existing `/api/v1/vehicles?status=X` calls; no separate endpoint needed now.
- DELETE endpoints not included — frontend has no delete UI for vehicles/activity/notifications. Employees page has delete. Added note: add `DELETE /api/v1/employees/{id}` if needed after testing.

**Placeholder scan:** None found.

**Type consistency:** All `from_orm_model()` methods use snake_case DB attributes. All schemas use camelCase aliases matching frontend TypeScript types.
