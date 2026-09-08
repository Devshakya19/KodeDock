import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/shared/lib/auth/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookie(response, request);
  return response;
}
