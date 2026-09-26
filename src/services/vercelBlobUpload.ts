import type { DirectUploadAuthorization } from "@/src/types/api";
import { requireApiBaseUrl } from "@/src/constants/config";
import { authenticatedFetch } from "@/src/api/client";

type PresignResponse = {
  uploadUrl: string;
  pathname: string;
  contentType: string;
  headers: Record<string, string>;
};

export type DirectBlobUploadResult = { url: string; pathname: string };

function assertUploadResult(value: unknown, pathname: string): DirectBlobUploadResult {
  if (!value || typeof value !== "object") throw new Error("The upload service returned an invalid response.");
  const result = value as { url?: unknown; pathname?: unknown };
  if (typeof result.url !== "string" || typeof result.pathname !== "string" || result.pathname !== pathname) {
    throw new Error("The upload service returned an invalid response.");
  }
  return { url: result.url, pathname: result.pathname };
}

/**
 * Uploads a native Blob/File directly to Vercel Blob. Only the small, bearer-
 * authenticated presign request traverses the Node API; binary content never
 * enters a Vercel Function and no Blob credential is stored in the app.
 */
export async function uploadToAuthorizedBlob(input: {
  authorization: DirectUploadAuthorization;
  body: Blob;
  contentType: string;
}): Promise<DirectBlobUploadResult> {
  const authorizationResponse = await authenticatedFetch(`${requireApiBaseUrl()}/storage/uploads/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent: input.authorization.intent }),
  });
  if (!authorizationResponse.ok) throw new Error("Could not prepare this upload. Please try again.");

  let presign: PresignResponse;
  try { presign = await authorizationResponse.json() as PresignResponse; } catch { throw new Error("Could not prepare this upload. Please try again."); }
  if (
    typeof presign.uploadUrl !== "string" ||
    typeof presign.pathname !== "string" ||
    presign.pathname !== input.authorization.pathname ||
    typeof presign.contentType !== "string" ||
    presign.contentType !== input.contentType ||
    !presign.headers ||
    typeof presign.headers !== "object"
  ) {
    throw new Error("Could not prepare this upload. Please try again.");
  }

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: presign.headers,
    body: input.body,
  });
  if (!uploadResponse.ok) throw new Error("Photo upload failed. Check your connection and try again.");

  try { return assertUploadResult(await uploadResponse.json(), input.authorization.pathname); } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Photo upload failed. Please try again.");
  }
}
