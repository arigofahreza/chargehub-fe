import { NextRequest, NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL ?? "http://localhost:8001";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const upstream = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data: unknown;
    try {
      data = await upstream.json();
    } catch {
      return NextResponse.json(
        { error: "ML service returned non-JSON response", status: upstream.status },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { error: "ML service unavailable", detail: String(err) },
      { status: 503 }
    );
  }
}
