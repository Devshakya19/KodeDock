/**
 * File upload — presign request goes through the proxy (needs auth cookie).
 *
 * The actual file PUT goes through a Next.js API route proxy that forwards
 * to SeaweedFS internally. This avoids exposing SeaweedFS to the browser.
 */

const PROXY_BASE = "/api/proxy";

interface PresignResponse {
  upload_url: string;
  public_url: string;
  key: string;
}

export interface UploadResult {
  public_url: string;
  key: string;
}

export async function uploadFile(
  file: File,
  purpose: "product" | "avatar"
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File must be less than 5MB");
  }

  // Step 1: Get presigned URL via proxy (small JSON, cookie auth)
  const presignRes = await fetch(`${PROXY_BASE}/upload/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      purpose,
    }),
  });

  if (!presignRes.ok) {
    throw new Error("Failed to get upload URL");
  }

  const presignData = await presignRes.json();
  if (!presignData.success) {
    throw new Error(presignData.error || "Failed to get upload URL");
  }

  const { upload_url, public_url, key }: PresignResponse = presignData.data;

  // Step 2: Upload file through Next.js proxy to SeaweedFS
  // The proxy rewrites localhost:8333 → seaweedfs:8333 (Docker internal)
  const uploadRes = await fetch(`/api/upload/file?url=${encodeURIComponent(upload_url)}`, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(errData.error || "Failed to upload file");
  }

  return { public_url, key };
}
