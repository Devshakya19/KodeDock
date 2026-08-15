import { NextResponse } from "next/server";

const RUST_BACKEND = process.env.CORE_ENGINE_URL || "http://localhost:4001";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${RUST_BACKEND}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "Backend connection failed" },
      { status: 502 }
    );
  }
}
