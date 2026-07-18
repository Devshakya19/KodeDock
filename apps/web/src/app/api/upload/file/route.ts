import { NextRequest, NextResponse } from "next/server";

const SEAWEEDFS_FILER = process.env.SEAWEEDFS_FILER_URL || "http://seaweedfs:8888";

/**
 * Proxy file uploads to SeaweedFS via the filer API (port 8888).
 * The browser PUTs here instead of directly to SeaweedFS.
 */
export async function PUT(request: NextRequest) {
  try {
    const uploadUrl = request.nextUrl.searchParams.get("url");
    if (!uploadUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // SSRF protection — only allow SeaweedFS URLs
    if (!uploadUrl.includes("seaweedfs") || !uploadUrl.includes(":8333")) {
      return NextResponse.json({ error: "Invalid upload URL" }, { status: 403 });
    }

    // Extract the key from the presigned URL (everything after the bucket name)
    // e.g. http://seaweedfs:8333/codehaat-media/products/uuid.png → products/uuid.png
    const urlObj = new URL(uploadUrl);
    const fullPath = urlObj.pathname; // /codehaat-media/products/uuid.png
    const key = fullPath.replace("/codehaat-media/", ""); // products/uuid.png

    // Upload via filer API (no S3 auth needed)
    const fileBody = await request.arrayBuffer();
    const contentType = request.headers.get("content-type") || "application/octet-stream";

    const filerUrl = `${SEAWEEDFS_FILER}/codehaat-media/${key}`;
    const filerRes = await fetch(filerUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: fileBody,
    });

    if (!filerRes.ok) {
      const errText = await filerRes.text();
      console.error("SeaweedFS filer upload failed:", filerRes.status, errText);
      return NextResponse.json({ error: "Upload to storage failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ error: "Upload proxy failed" }, { status: 500 });
  }
}
