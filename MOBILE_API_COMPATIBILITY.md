# Mobile API Compatibility

All routes below are relative to `EXPO_PUBLIC_API_BASE_URL`, which must include `/api`. Responses use the existing `{ success, message, data }` envelope and are unwrapped centrally in `src/api/client.ts`.

## Live verification (2026-09-25)

The ignored local environment used `https://api.starrynightsindia.in/api` and the suffix was validated. Successful reads returned HTTP 200 with `success: true`: 5 hero sliders, 17 home featured rows, 5 statistics, a `null` current occasion, 859 packages, 439 categories, 149 gallery images, and zero public notifications. A real package code (`ADR01D01`) and category code (`DUR-01D`) were read from those responses and produced a successful package detail and 65 category packages respectively.

`POST /chatbot/query` was checked only with a whitespace message. It returned HTTP 400 and `success: false` before the route could persist an interaction. A normal chatbot query was deliberately not sent because the existing server records every query. `POST /enquiries` with `{}` unexpectedly returned HTTP 200 rather than rejecting missing name/contact; current Node source returns the required HTTP 400 JSON envelope, so this is a hosted deployment/proxy discrepancy, not a successful mobile-enquiry verification. A no-bearer `GET /users/me` returned an empty HTTP 403; current Node source returns a 401 JSON envelope, so this is also a hosted deployment/proxy discrepancy. The mobile interceptor was hardened to retry one token refresh for a 403 only when the original request actually carried a bearer token.

| Method | Route | Mobile feature | Auth | Request / response | Status |
| --- | --- | --- | --- | --- | --- |
| GET | `/hero-sliders/public` | Home | No | public hero array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/featured-rows/public?visibleOn=home` | Home rows | No | public featured row array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/featured-rows/public?visibleOn=trending` | Trending discovery | No | public featured row array | IMPLEMENTED / API CONTRACT VERIFIED |
| GET | `/homepage-statistics/public` | Home | No | statistic array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/occasion-popups/current` | Home promotion | No | popup or null | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/packages` | Explore/search catalogue | No | package summary array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/packages/:code` | Package detail | No | package detail | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/categories` | Explore | No | category array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/categories/tree` | Category rail, drill-down, Global Explorer, World Time | No | nested category array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/categories/:code/packages` | Category results | No | package summary array | IMPLEMENTED / LIVE API VERIFIED |
| POST | `/package-views` | Record view | Optional | `packageCode`, optional guest `sessionIdentifier` / view | IMPLEMENTED |
| POST | `/enquiries` | Enquiry | No | existing enquiry form fields / enquiry | IMPLEMENTED; hosted invalid-payload validation observed HTTP 200, while current Node source returns HTTP 400 — deployment/proxy verification required |
| GET | `/gallery/public` | Gallery | No | approved featured gallery array | IMPLEMENTED / LIVE API VERIFIED |
| GET | `/notifications/public` | Guest updates | No | notification array | IMPLEMENTED / LIVE API VERIFIED |
| POST | `/chatbot/query` | ATLAS | No | `message`, `sessionId` / chat answer, packages, replies | IMPLEMENTED; invalid-payload validation LIVE API VERIFIED (HTTP 400); normal query not sent to avoid a persistent production interaction |
| POST | `/contact` | Support form | No | name, email, phone, message / receipt | IMPLEMENTED |
| POST | `/auth/google` | Google login | No | `{ idToken }` / token session | IMPLEMENTED / LIVE STAGING VERIFIED by the owner with Android native sign-in |
| POST | `/auth/refresh` | Token refresh | No | `{ refreshToken }` / token session | IMPLEMENTED; owner observed the normal authenticated flow, failure cleanup BUILD VERIFIED |
| POST | `/auth/logout` | Logout | No | `{ refreshToken }` / message | IMPLEMENTED; owner verified logout; cleanup BUILD VERIFIED |
| GET | `/users/me` | Session/profile | USER | user | IMPLEMENTED; authenticated profile persistence independently observed by ADB after relaunch; hosted no-bearer response historically observed as empty HTTP 403 |
| PUT | `/users/:id` | Profile edit | USER/self | supported profile fields / user | IMPLEMENTED |
| PUT | `/users/me/complete-profile` | Profile completion | USER | name/contact/country/state/city + optional profile fields / user | IMPLEMENTED |
| GET | `/users/me/bucket-list` | Bucket list | USER | package summary array | IMPLEMENTED |
| POST | `/users/me/bucket-list/:packageCode` | Bucket toggle | USER | no body / authoritative bucket array | IMPLEMENTED |
| GET | `/package-views/me` | Recently viewed | USER | view history array | IMPLEMENTED |
| DELETE | `/package-views/me/:packageCode` | Remove history item | USER | message | IMPLEMENTED |
| DELETE | `/package-views/me` | Clear history | USER | message | IMPLEMENTED |
| GET | `/mytours` | Trips | USER | customer tour array | IMPLEMENTED |
| GET | `/tours/:tourId` | Trip detail | USER/owner | customer-safe tour detail | IMPLEMENTED |
| GET | `/my-payments` | Payments | USER | payment array incl. existing hosted URL | IMPLEMENTED |
| GET | `/payments/invoice/:tourId` | Invoice | USER/owner | invoice summary | IMPLEMENTED |
| GET | `/notifications/me` | Account updates | USER | public + targeted notification array | IMPLEMENTED |
| GET | `/get-photos` | My travel photos | USER | user's gallery-image array | IMPLEMENTED |
| POST | `/upload-photo/authorize` | Travel-photo authorization | USER | filename, MIME type, declared size / scoped intent | IMPLEMENTED |
| POST | `/storage/uploads/presign` | Direct Blob control exchange | USER + matching scoped intent | opaque intent / server-issued `uploadUrl`, constrained headers, pathname, content type | IMPLEMENTED |
| POST | `/upload-photo/finalize` | Travel-photo finalization | USER + matching scoped intent | Blob URL + intent / gallery image | IMPLEMENTED |
| POST | `/upload-photo` | Legacy small travel photo upload | USER | multipart `file`, up to 4 MB / gallery image | API compatibility retained; mobile uses the direct flow |
| DELETE | `/delete-photo/:imageId` | My travel photos | USER/owner | message | IMPLEMENTED |

## Intentionally not called by mobile

- `POST /payments/razorpay` and payment-link management routes: correctly `SUPER_ADMIN` only. The app can open an already issued `razorpayShortUrl` and refreshs `/my-payments` afterward.
- Admin catalog, notification, media, tour and user-management routes: not customer capabilities.
- No customer-visible public category endpoint is intentionally omitted. Mobile
  uses `GET /categories/tree` for the home category rail, category drill-down,
  Global Explorer and World Time discovery; it retains `/categories/:code/packages`
  for leaf package lists.

## Search contract

The existing Node catalog route has category, brand and row filters but no query-string full-text search parameter. The public web application itself fetches `/packages` and filters the returned package fields client-side. Mobile implements the same API-backed behavior; no replacement search API is introduced.

## Payment and photo safety checks

- The mobile code contains no Razorpay key, secret, payment-link creation request, webhook request, or payment-status trust based on browser-return parameters. `app/payments.tsx` accepts only an HTTPS `razorpayShortUrl` from `GET /my-payments`, opens it in the system browser, then refetches the authoritative server list. No live payment was attempted.
- `GET /get-photos`, the direct authorize/presign/finalize sequence, and `DELETE /delete-photo/:imageId` are the authenticated travel-photo contract. The selected file uploads directly to private Blob with a short-lived authorization; it does not pass through a Vercel Function and no Blob credential is in the app. The legacy multipart endpoint remains only for small compatibility clients. The app has no fake avatar endpoint or profile-avatar upload behavior. No customer photo mutation was performed in this Vercel-readiness pass.

## Isolated staging API acceptance update — 2026-09-26

Using the clearly marked staging USER fixture (not a Google-login test), the
Node API passed `/users/me`, profile completion, bucket toggle, package-view
create/read/remove, `/mytours`, `/tours/:tourId`, `/my-payments`, invoice,
targeted notifications, and travel-photo upload/read/delete. Public catalogue,
category, detail, gallery, enquiry validation/create/cleanup, and chatbot
checks also passed. Native device requests, public/admin browser pages through
a staging reverse proxy, and mobile Google sign-in remain pending.

## Mobile staging-target readiness — 2026-09-26

All application route calls remain relative to the one `API_BASE_URL` exported
from `src/constants/config.ts`; services never own a hostname. The only other
HTTP client is the internal refresh-only Axios instance in `src/api/client.ts`.
`scripts/staging-api-smoke.mjs` is a Node test harness, not application runtime
code, and also derives its target from `EXPO_PUBLIC_API_BASE_URL`.

The harness checks `/health`, packages, categories, hero sliders, featured
rows, statistics, occasion content, gallery, public notifications, a package
detail, category packages, and non-persistent 400 validation for enquiry and
chatbot. It rejects `api.starrynightsindia.in` before calling the network, so
it cannot modify production. **STAGING API URL REQUIRED:** the deployment host
is not yet assigned, therefore this harness has not made a live staging call.

The staging USER fixture and retained `STG-CUTOVER-TOUR-E97EFF6E` tour have
already passed Node API-level ownership/response validation. No fixture token
or tour reference is embedded in the mobile app. Device flows must obtain a
normal server-issued staging session once native Google configuration exists.
