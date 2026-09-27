# Mobile pre-testing readiness

Date: 2026-09-26

## Architecture and configuration: PASS

- Mobile architecture is API-only: mobile → Node API → `node-staging` Neon.
- Runtime requests use the single Axios client in `src/api/client.ts`; the
  refresh-only bare Axios instance is internal to that same client.
- Runtime source contains no production API hostname, localhost target,
  direct database client, direct `fetch`, or duplicated Axios client. The only
  production hostname match is a negative safety guard in the staging smoke
  script.
- `EXPO_PUBLIC_API_BASE_URL` is required, must end in `/api`, and cannot use
  HTTP outside a development runtime. Preview has no production fallback.
- Safe `.env.local`, `.env.staging`, and `.env.production` templates exist as
  ignored-file examples. EAS profiles explicitly select development, preview,
  and production environments.

## Backend contract and flow readiness: PASS AT API LEVEL

The completed Node staging integration pass validated the `node-staging`
branch and the marked USER fixture for customer API contract coverage. Mobile
uses those same routes for profile, bucket list, recent views, tours, payments,
invoice, notifications, and private travel photos. This is API compatibility,
not live Google or physical-device verification.

The retained staging-only tour reference
`STG-CUTOVER-TOUR-E97EFF6E` may be used in test documentation and staging
assertions only. It is not present in mobile application code.

## Mobile hardening: PASS

- Access and refresh tokens use Expo SecureStore only; logout and failed
  refresh clear the stored session.
- A request refreshes at most once (`_retried`), auth routes bypass refresh,
  concurrent refreshes share one promise, and an invalid session clears state.
- Bearer 401 and bearer-only 403 responses can attempt refresh; a generic 403
  does not cause a refresh loop.
- Timeout, offline/network, 400 validation, 401, 403, 404, and 5xx responses
  map to customer-safe messages. Raw server traces are not displayed.
- Travel-photo selection restricts client input to JPEG, PNG, or WebP and 25
  MB; Node remains authoritative for upload and deletion validation.
- Payments only render/open server-issued HTTPS links and refetch authoritative
  backend status after browser return.

## Static verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npx expo config --type public` | PASS with the verified staging API target; no secret values are present in public config |
| `npx expo-doctor` | PASS — 18/18 checks on 2026-09-27 after installing `expo-constants` directly and aligning React Native to Expo SDK 54's supported 0.81.5 patch |
| Android JS export | PASS — staging-configured Android bundle exported successfully on 2026-09-27; temporary output is ignored |
| `npm run staging:smoke` | PASS — verified health, public home/catalogue/category/package/gallery content and safe enquiry/chatbot validation against the Vercel staging API |
| Staging smoke production-host guard | PASS — script refuses production before any request |
| Mobile secret scan | PASS — no server/database secret or credential found |

## Blocking external steps

1. Build and install the next cache-cleared Android Preview APK. The existing
   stable baseline build already launches on the physical device; the new APK
   must prove Android Credential Manager sign-in without Chrome.
2. Complete Google login, `/users/me`, refresh, reload persistence and logout
   with a staging-safe Google account, then exercise authenticated staging
   fixtures without a payment or customer email.
3. Create an iOS Google OAuth client and complete Apple/TestFlight setup before
   considering an iOS release.

## Decision

**Safe for anonymous physical staging testing: YES.** The approved EAS account
has the staging API and Android/Web public OAuth configuration in `preview`.
Native Android Google acceptance is pending the next internal APK; the
application has no production database connection.
