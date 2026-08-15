import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const proto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
  const isSecure = proto === "https";

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("codehaat_token", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
