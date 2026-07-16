import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // In our custom auth system, logout is handled client-side
  // The client removes the token from localStorage
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
