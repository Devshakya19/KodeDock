import { auth } from "@/shared/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

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

  const session = await auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const presignRes = await fetch(`${API_URL}/api/upload/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
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

  const { upload_url, public_url }: PresignResponse = presignData.data;

  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file");
  }

  return { public_url, key: presignData.data.key };
}
