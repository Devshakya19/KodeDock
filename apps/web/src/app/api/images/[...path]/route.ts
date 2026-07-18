import { NextRequest, NextResponse } from "next/server";

const SEAWEEDFS_FILER = process.env.SEAWEEDFS_FILER_URL || "http://seaweedfs:8888";

/**
 * Proxy image requests to SeaweedFS.
 * Browser requests /api/images/<path> → this forwards to seaweedfs:8333 internally.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  if (!key || (!key.startsWith("products/") && !key.startsWith("avatars/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  const imageUrl = `${SEAWEEDFS_FILER}/codehaat-media/${key}`;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const body = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
}
