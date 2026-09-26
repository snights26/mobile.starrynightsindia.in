import type { DirectUploadAuthorization } from "@/src/types/api";
import { requireApiBaseUrl } from "@/src/constants/config";
import { authenticatedFetch } from "@/src/api/client";

type PresignedPayload = {
  delegationToken: string;
  signature: string;
  params: Record<string, string>;
};

type PresignResponse = {
  type: "blob.generate-presigned-url";
  presignedUrlPayload: PresignedPayload;
};

export type DirectBlobUploadResult = { url: string; pathname: string };

const blobApiUrl = "https://vercel.com/api/blob";

function storeIdFromDelegationToken(token: string) {
  const encodedPayload = token.split(".")[0];
  if (!encodedPayload) throw new Error("The upload authorization is invalid. Please try again.");
  const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  try {
    const decoded = globalThis.atob(padded);
    const payload = JSON.parse(decoded) as { storeId?: unknown };
    if (typeof payload.storeId !== "string" || !payload.storeId.trim()) throw new Error("missing store ID");
    return payload.storeId.replace(/^store_/, "");
  } catch {
    throw new Error("The upload authorization is invalid. Please try again.");
  }
}

function makePresignedPutUrl(pathname: string, payload: PresignedPayload) {
  const url = new URL(`${blobApiUrl}/`);
  url.searchParams.set("pathname", pathname);
  for (const [key, value] of Object.entries(payload.params)) url.searchParams.set(key, value);
  url.searchParams.set("vercel-blob-delegation", payload.delegationToken);
  url.searchParams.set("vercel-blob-signature", payload.signature);
  return url.toString();
}

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
    body: JSON.stringify({
      type: "blob.generate-presigned-url",
      payload: {
        pathname: input.authorization.pathname,
        clientPayload: input.authorization.intent,
        // Expo's native fetch uploads the selected File as one direct Blob PUT.
        // This stays outside the Vercel Function's 4.5 MB body limit.
        multipart: false,
      },
    }),
  });
  if (!authorizationResponse.ok) throw new Error("Could not prepare this upload. Please try again.");

  let presign: PresignResponse;
  try { presign = await authorizationResponse.json() as PresignResponse; } catch { throw new Error("Could not prepare this upload. Please try again."); }
  if (presign.type !== "blob.generate-presigned-url" || !presign.presignedUrlPayload) {
    throw new Error("Could not prepare this upload. Please try again.");
  }

  const storeId = storeIdFromDelegationToken(presign.presignedUrlPayload.delegationToken);
  const uploadResponse = await fetch(makePresignedPutUrl(input.authorization.pathname, presign.presignedUrlPayload), {
    method: "PUT",
    headers: {
      "x-api-version": "12",
      "x-vercel-blob-store-id": storeId,
      "x-vercel-blob-access": input.authorization.access,
      "x-content-type": input.contentType,
    },
    body: input.body,
  });
  if (!uploadResponse.ok) throw new Error("Photo upload failed. Check your connection and try again.");

  try { return assertUploadResult(await uploadResponse.json(), input.authorization.pathname); } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Photo upload failed. Please try again.");
  }
}
