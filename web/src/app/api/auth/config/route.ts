import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.CORE_ENGINE_URL || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/auth/config`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ github_client_id: "" });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ github_client_id: "" });
  }
}
