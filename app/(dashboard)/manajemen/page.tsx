"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { UserTable } from "@/components/management/UserTable";
import { RegisterUserModal } from "@/components/management/RegisterUserModal";
import { CategoryList } from "@/components/management/CategoryList";
import { ActivityCategoryList } from "@/components/management/ActivityCategoryList";
import { BatteryDrainRateList } from "@/components/management/BatteryDrainRateList";
import { TelegramTokenTable } from "@/components/management/TelegramTokenTable";
import { Wave } from "@/components/ui/wave";
import {
  getUsers, patchUserRole, deleteUser,
  getVehicleCategories, createVehicleCategory, updateVehicleCategory, deleteVehicleCategory,
  getEmployeeCategories, createEmployeeCategory, updateEmployeeCategory, deleteEmployeeCategory,
  getActivityCategories, createActivityCategory, updateActivityCategory, deleteActivityCategory,
  getBatteryDrainRates, createBatteryDrainRate, updateBatteryDrainRate, deleteBatteryDrainRate,
  getEmployeeTokens, refreshEmployeeToken,
  type AdminUser, type Category, type EmployeeCategory, type ActivityCategory, type BatteryDrainRate, type EmployeeTokenInfo,
} from "@/lib/services/management";

type Tab = "pengguna" | "kendaraan" | "karyawan" | "aktivitas" | "baterai" | "telegram";

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(195,198,215,0.5)",
  borderRadius: 14,
  padding: 20,
};

export default function ManajemenPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const perms = usePermissions();
  const [tab, setTab] = useState<Tab>("pengguna");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vehicleCats, setVehicleCats] = useState<Category[]>([]);
  const [employeeCats, setEmployeeCats] = useState<EmployeeCategory[]>([]);
  const [activityCats, setActivityCats] = useState<ActivityCategory[]>([]);
  const [batteryRates, setBatteryRates] = useState<BatteryDrainRate[]>([]);
  const [employeeTokens, setEmployeeTokens] = useState<EmployeeTokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [reloadingTokens, setReloadingTokens] = useState(false);

  useEffect(() => {
    if (user && !perms.canAccessManagement) router.replace("/dashboard");
  }, [user, perms, router]);

  useEffect(() => {
    if (!perms.canAccessManagement) return;
    setLoading(true);
    Promise.all([getUsers(), getVehicleCategories(), getEmployeeCategories(), getActivityCategories(), getBatteryDrainRates(), getEmployeeTokens()])
      .then(([u, vc, ec, ac, br, et]) => {
        setUsers(u);
        setVehicleCats(vc);
        setEmployeeCats(ec);
        setActivityCats(ac);
        setBatteryRates(br);
        setEmployeeTokens(et);
      })
      .finally(() => setLoading(false));
  }, [perms.canAccessManagement]);

  async function handleRoleChange(userId: string, roleCategoryId: string) {
    const updated = await patchUserRole(userId, roleCategoryId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  }

  function handleUserRegistered(newUser: AdminUser) {
    setUsers((prev) => [...prev, newUser]);
    setShowRegisterModal(false);
  }

  async function handleDeleteUser(userId: string) {
    const ok = await deleteUser(userId);
    if (ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  async function handleAddVehicleCat(name: string) {
    const created = await createVehicleCategory(name);
    setVehicleCats((prev) => [...prev, created]);
  }

  async function handleEditVehicleCat(id: string, name: string) {
    const updated = await updateVehicleCategory(id, name);
    setVehicleCats((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function handleDeleteVehicleCat(id: string) {
    const ok = await deleteVehicleCategory(id);
    if (ok) setVehicleCats((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAddEmployeeCat(name: string) {
    const created = await createEmployeeCategory(name);
    setEmployeeCats((prev) => [...prev, created]);
  }

  async function handleEditEmployeeCat(id: string, name: string) {
    const updated = await updateEmployeeCategory(id, name);
    setEmployeeCats((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function handleDeleteEmployeeCat(id: string) {
    const ok = await deleteEmployeeCategory(id);
    if (ok) setEmployeeCats((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleRefreshEmployeeToken(employeeId: string) {
    const updated = await refreshEmployeeToken(employeeId);
    setEmployeeTokens((prev) => prev.map((e) => (e.id === employeeId ? updated : e)));
  }

  const handleReloadTokens = useCallback(async () => {
    setReloadingTokens(true);
    try {
      const et = await getEmployeeTokens();
      setEmployeeTokens(et);
    } finally {
      setReloadingTokens(false);
    }
  }, []);

  async function handleAddBatteryRate(activityId: string, persenPenurunan: number) {
    const created = await createBatteryDrainRate(activityId, persenPenurunan);
    setBatteryRates((prev) => [...prev, created]);
  }

  async function handleEditBatteryRate(id: string, persenPenurunan: number) {
    const updated = await updateBatteryDrainRate(id, persenPenurunan);
    setBatteryRates((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  async function handleDeleteBatteryRate(id: string) {
    const ok = await deleteBatteryDrainRate(id);
    if (ok) setBatteryRates((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleAddActivityCat(name: string, iconFile: File) {
    const created = await createActivityCategory(name, iconFile);
    setActivityCats((prev) => [...prev, created]);
  }

  async function handleEditActivityCat(id: string, name: string, iconFile?: File) {
    const updated = await updateActivityCategory(id, name, iconFile);
    setActivityCats((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function handleDeleteActivityCat(id: string) {
    const ok = await deleteActivityCategory(id);
    if (ok) setActivityCats((prev) => prev.filter((c) => c.id !== id));
  }

  if (!perms.canAccessManagement) return null;



  function tabStyle(active: boolean): React.CSSProperties {
    return {
      padding: "8px 18px",
      borderRadius: 9999,
      border: "none",
      background: active ? "#DA0037" : "#EDEDED",
      color: active ? "#fff" : "#444",
      fontWeight: 600,
      fontSize: 12,
      fontFamily: "inherit",
      cursor: "pointer",
      transition: "all 0.15s ease",
    };
  }

  return (
    <>
    {showRegisterModal && (
      <RegisterUserModal
        employeeCategories={employeeCats}
        onSuccess={handleUserRegistered}
        onClose={() => setShowRegisterModal(false)}
      />
    )}
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible">
      <main className="p-4 md:p-6 space-y-5">
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, color: "#171717", letterSpacing: "-0.4px" }}>Manajemen</h1>
          <p style={{ fontSize: 13, color: "#444444" }}>Kelola pengguna, kategori kendaraan, dan kategori karyawan.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={tabStyle(tab === "pengguna")} onClick={() => setTab("pengguna")}>Pengguna</button>
          <button style={tabStyle(tab === "kendaraan")} onClick={() => setTab("kendaraan")}>Kategori Kendaraan</button>
          <button style={tabStyle(tab === "karyawan")} onClick={() => setTab("karyawan")}>Kategori Karyawan</button>
          <button style={tabStyle(tab === "aktivitas")} onClick={() => setTab("aktivitas")}>Kategori Aktivitas</button>
          <button style={tabStyle(tab === "baterai")} onClick={() => setTab("baterai")}>Penurunan Baterai</button>
          <button style={tabStyle(tab === "telegram")} onClick={() => setTab("telegram")}>Token Telegram</button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#DA0037]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Memuat data...</p>
          </div>
        ) : (
          <>
            {tab === "pengguna" && (
              <div style={sectionStyle}>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: "#171717", marginBottom: 16 }}>Manajemen Pengguna</h2>
                <UserTable
                  users={users}
                  currentUserId={user?.id ?? ""}
                  currentUserRole={user?.role ?? "operator"}
                  employeeCategories={employeeCats}
                  onRoleChange={handleRoleChange}
                  onDelete={handleDeleteUser}
                  onAddUser={() => setShowRegisterModal(true)}
                />
              </div>
            )}
            {tab === "kendaraan" && (
              <div style={sectionStyle}>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: "#171717", marginBottom: 16 }}>Kategori Kendaraan</h2>
                <CategoryList
                  categories={vehicleCats}
                  onAdd={handleAddVehicleCat}
                  onEdit={handleEditVehicleCat}
                  onDelete={handleDeleteVehicleCat}
                  placeholder="cth. Dump Truck 50T..."
                />
              </div>
            )}
            {tab === "karyawan" && (
              <div style={sectionStyle}>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: "#171717", marginBottom: 16 }}>Kategori Karyawan</h2>
                <CategoryList
                  categories={employeeCats}
                  onAdd={handleAddEmployeeCat}
                  onEdit={handleEditEmployeeCat}
                  onDelete={handleDeleteEmployeeCat}
                  placeholder="cth. Supervisor Lapangan..."
                />
              </div>
            )}
            {tab === "aktivitas" && (
              <div style={sectionStyle}>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: "#171717", marginBottom: 4 }}>Kategori Aktivitas</h2>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Setiap kategori tampil sebagai tombol di form input aktivitas. Icon wajib diunggah.</p>
                <ActivityCategoryList
                  categories={activityCats}
                  onAdd={handleAddActivityCat}
                  onEdit={handleEditActivityCat}
                  onDelete={handleDeleteActivityCat}
                />
              </div>
            )}
            {tab === "baterai" && (
              <div style={sectionStyle}>
                <h2 style={{ fontWeight: 700, fontSize: 15, color: "#171717", marginBottom: 4 }}>Penurunan Baterai per Aktivitas</h2>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Konfigurasi persentase penurunan baterai untuk setiap jenis aktivitas.</p>
                <BatteryDrainRateList
                  rates={batteryRates}
                  activityCategories={activityCats}
                  onAdd={handleAddBatteryRate}
                  onEdit={handleEditBatteryRate}
                  onDelete={handleDeleteBatteryRate}
                />
              </div>
            )}
            {tab === "telegram" && (
              <div style={sectionStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 15, color: "#171717", margin: 0 }}>Token Telegram</h2>
                  <button
                    onClick={handleReloadTokens}
                    disabled={reloadingTokens}
                    title="Refresh daftar"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: 8,
                      border: "1px solid #EDEDED", background: "#F4F5F7",
                      cursor: reloadingTokens ? "not-allowed" : "pointer",
                      opacity: reloadingTokens ? 0.5 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <RefreshCw
                      size={13}
                      color="#555"
                      style={{ animation: reloadingTokens ? "spin 0.8s linear infinite" : "none" }}
                    />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Generate token per karyawan untuk subscribe notifikasi via bot Telegram.</p>
                <TelegramTokenTable
                  employees={employeeTokens}
                  onRefreshToken={handleRefreshEmployeeToken}
                />
              </div>
            )}
          </>
        )}
      </main>
    </motion.div>
    </>
  );
}
