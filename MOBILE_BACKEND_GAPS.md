# Mobile Backend Gaps / Configuration Findings

This record was updated during the final pre-testing completion pass. The
legacy Spring/public/admin applications remain unmodified.

## 1. Multi-platform Google identity audience — CODE FIXED; configuration and device verification remain

`POST /api/auth/google` now reads `GOOGLE_ALLOWED_CLIENT_IDS` as a trimmed,
deduplicated comma-separated allowlist. `GOOGLE_CLIENT_ID` remains a temporary
single-client migration fallback and is added to that allowlist when present.

Configure, for example:

```text
GOOGLE_ALLOWED_CLIENT_IDS=web-client-id.apps.googleusercontent.com,android-client-id.apps.googleusercontent.com,ios-client-id.apps.googleusercontent.com
```

The API constructs `OAuth2Client` without pinning it to one client and calls
`verifyIdToken` with the allowlist. It then requires returned `aud` to be an
exact member and, when present, requires `azp` to be an exact member too. A
Google-enabled Node process refuses to start when the resulting allowlist is
empty.

Google library signature, issuer and expiry validation remain in use. The API
explicitly accepts only `https://accounts.google.com` and
`accounts.google.com`, requires a verified email, and redacts `idToken`, access
tokens and refresh tokens from request logging. Focused unit tests cover
allowlist parsing, accepted Web/Android/iOS audiences, and rejected
unlisted/empty/unauthorized-party configurations.

Before native Google launch: create/register the Web, Android and iOS clients;
set all IDs in the Node allowlist and corresponding public mobile build
environment; then perform live test sign-in on Android and iOS. Provider-issued
token signature/issuer verification remains the responsibility of
`google-auth-library` and must be exercised with safe registered test
identities.

## 2. Customer profile-avatar binary upload — DEFERRED, NOT V1 BLOCKER

The USER photo capability creates a private customer gallery record, now by a
scoped direct-object-storage authorization/finalization flow for files up to
25 MB. The legacy public profile renders a selected file only as a local
preview; it does not upload the file or persist it.

Mobile implements the actual supported customer-photo/gallery flow. Do not add
a profile-avatar endpoint until it is an approved product requirement. At that
time it must be authenticated for the current USER, image-only, use the
existing storage abstraction, replace/delete through a server-controlled media
identifier, and never accept an arbitrary client URL as authoritative.

## 3. Customer-initiated payment-link creation

The API intentionally permits `POST /payments/razorpay` only to
`SUPER_ADMIN`. This is correct for the server-controlled Razorpay Payment Link
process. Mobile safely opens a pre-issued link from `GET /my-payments`; it does
not create links or need a new route.

## 4. Invoice document output

`GET /payments/invoice/:tourId` returns a secure JSON invoice summary, not a
PDF or document URL. Mobile renders and shares the actual summary. A server PDF
endpoint is optional future work, not required for the existing contract.

## 5. Hosted enquiry validation — DEPLOYMENT VERSION MISMATCH / HOSTED SERVICE NOT YET CONFIRMED NODE

The inspected Node implementation rejects `POST /enquiries` unless both `name`
and one of `contact`/`phone`/`mobile` are present, returning HTTP 400 with the
shared `{ success: false, message, data: null }` envelope. On 2026-09-25, the
hosted API at `https://api.starrynightsindia.in/api/enquiries` returned HTTP 200
to a deliberately empty JSON body `{}`.

No valid enquiry or customer data was sent. The verification harness did not
retain the response envelope, so it cannot establish whether the hosted service
rejected at application level or wrote a record. Do not repeat the production
write probe. An authorized administrator must inspect the enquiry list/logs for
that run and identify the hosted backend/reverse-proxy target. After the Node
staging deployment, test one invalid payload there and require explicit HTTP
400 before treating live enquiry submission as verified.

## 6. Hosted unauthenticated error contract — DEPLOYMENT VERSION MISMATCH / REVERSE PROXY ISSUE

The live no-bearer request to `GET /api/users/me` returned an empty HTTP 403.
Node consistently sends the shared error envelope: missing, expired and invalid
bearers are HTTP 401; authenticated callers without a required role are HTTP
403. The hosted result is therefore outside the inspected Node implementation.

Mobile remains defensive: its Axios client treats HTTP 401, and HTTP 403 only
when the original request carried a bearer token, as a single refresh
candidate. It then clears SecureStore and ends the session if refresh fails.
The staging reverse proxy must preserve Node's status/body for `/api/*`; verify
that before acceptance testing.

## 7. Native OAuth audiences — CONFIGURATION PENDING

The existing legacy configuration supplies a Web Google audience only. Node's
staging allowlist accepts that verified Web audience, but no Android or iOS
client ID was found or invented. Create the registered native OAuth clients,
add their public IDs to `GOOGLE_ALLOWED_CLIENT_IDS` and mobile public build
configuration, then perform developer-owned Android/iOS sign-in acceptance.

## 8. Staging API deployment URL — REQUIRED FOR MOBILE PREVIEW

The `node-staging` Neon branch and direct Node API integration pass are
verified, but no deployed HTTPS staging API hostname is recorded. Mobile does
not invent one and has no production fallback. Before a preview build, deploy
the Node API/reverse proxy and configure only the EAS `preview` environment:

```text
EXPO_PUBLIC_API_BASE_URL=https://<staging-api-host>/api
```

The proxy must preserve the Node API's `/api` path, JSON error envelope, and
401/403 semantics. Then run the production-host-refusing
`npm run staging:smoke` check and complete a physical-device pass.
