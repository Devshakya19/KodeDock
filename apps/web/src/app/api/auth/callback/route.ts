import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // TODO: Implement OAuth callback with custom auth
  // For now, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
