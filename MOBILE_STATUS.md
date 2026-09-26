# Starry Nights Mobile Status

Status labels: **IMPLEMENTED** means code is connected to the existing contract; **BUILD VERIFIED** means local static checks passed; **RUNTIME VERIFIED** means an Expo launch was observed; **LIVE API VERIFIED** means a read-only production API request completed on 2026-09-25; **LIVE GOOGLE AUTH NOT YET VERIFIED** requires configured OAuth credentials and a test identity.

## Foundation

- [x] Expo project — IMPLEMENTED
- [x] Expo Router stack and tabs — IMPLEMENTED
- [x] Central Axios client and API-envelope handling — IMPLEMENTED
- [x] TanStack Query public/authenticated cache layer — IMPLEMENTED
- [x] Shared theme tokens and reusable controls — IMPLEMENTED
- [x] SecureStore session storage — IMPLEMENTED

## Public

- [x] Home (hero, featured rows, categories, statistics, occasion content) — IMPLEMENTED / LIVE API VERIFIED
- [x] Explore and category package lists — IMPLEMENTED / LIVE API VERIFIED
- [x] Package details, gallery, save, share, enquiry action — IMPLEMENTED; catalogue, category, detail and gallery APIs LIVE VERIFIED
- [x] Catalogue search (same client-side API-backed behavior as public web) — IMPLEMENTED; catalogue API LIVE VERIFIED
- [x] Gallery full-screen viewer — IMPLEMENTED / LIVE API VERIFIED
- [x] Enquiry form and native date picker — IMPLEMENTED; local Node source rejects an empty payload with HTTP 400, while the hosted HTTP 200 result remains a deployment/proxy mismatch (see `MOBILE_BACKEND_GAPS.md`)
- [x] ATLAS chatbot — IMPLEMENTED; invalid-payload validation LIVE API VERIFIED; no successful query was sent because that endpoint persistently records every interaction
- [x] Contact, about, terms/cancellation summaries — IMPLEMENTED

## Customer

- [x] Google auth integration structure — IMPLEMENTED / LIVE GOOGLE AUTH NOT YET VERIFIED
- [x] Session restore, automatic refresh, invalid-session cleanup — IMPLEMENTED / BUILD VERIFIED; no real credential was used
- [x] Profile and profile completion — IMPLEMENTED
- [x] Bucket list — IMPLEMENTED
- [x] Recently viewed — IMPLEMENTED
- [x] Tours and trip details — IMPLEMENTED
- [x] Payments and server-issued payment links — IMPLEMENTED / static flow verified; no payment was opened or created
- [x] Invoice summary/share — IMPLEMENTED
- [x] Notifications — IMPLEMENTED
- [x] Customer travel photos — IMPLEMENTED / BUILD VERIFIED: scoped direct private-Blob upload supports JPEG/PNG/WebP up to 25 MB without a Function binary request; existing API remains gallery photos, not profile-avatar upload

## Native

- [x] Native package/invoice share — IMPLEMENTED
- [x] Secure token storage — IMPLEMENTED
- [x] Hosted payment browser handoff and status refresh — IMPLEMENTED
- [x] Image picker — IMPLEMENTED
- [x] Loading, empty, network-error and auth-expiry states — IMPLEMENTED
- [x] Accessibility labels on critical icon actions — IMPLEMENTED

## Verification

- [x] Typecheck — BUILD VERIFIED
- [x] Lint — BUILD VERIFIED
- [ ] Expo Doctor — HOST INCONCLUSIVE; no usable report returned from this Windows host, so it is not marked verified
- [x] Android JS bundle export — BUILD VERIFIED on 2026-09-26 with the verified staging API environment loaded
- [x] Metro startup smoke test — RUNTIME VERIFIED on 2026-09-25 (Metro served HTTP 200 on localhost)
- [x] Public API compatibility — LIVE STAGING API VERIFIED on `https://node-api-starrynightsindia-in.vercel.app/api`; read-only home, catalogue, category, package-detail, gallery and public-notification calls returned the standard success envelope
- [x] Chatbot invalid-request validation — LIVE API VERIFIED (HTTP 400, no interaction created)
- [x] Auth/session safety paths — BUILD VERIFIED by implementation and Android bundle review: SecureStore only, guarded queries, a single 401/bearer-403 refresh retry, failed-refresh cleanup and logout cleanup
- [x] Dependency audit — `npm audit --omit=dev` reports 15 moderate / 2 high upstream Expo SDK 54 ecosystem advisories. Findings and the non-disruptive upgrade path are in `MOBILE_DEPENDENCY_AUDIT.md`.
- [ ] Android device launch — no Android SDK/`adb` device or emulator available in this environment
- [x] iOS configuration — IMPLEMENTED; device verification pending
- [ ] Device UX checks — cold-start UI, tabs, keyboard, Android back navigation, safe areas, sharing and image rendering require an Android device/emulator

## Deliberately excluded from v1

- Push-token registration/delivery (design in `PUSH_NOTIFICATION_PLAN.md`)
- Client-side payment creation (the existing API correctly limits Razorpay-link creation to `SUPER_ADMIN`)
- Profile-avatar binary upload (there is no existing customer-safe API route; documented in `MOBILE_BACKEND_GAPS.md`)

## Verification environment

- An ignored local `.env` temporarily supplied `EXPO_PUBLIC_API_BASE_URL=https://api.starrynightsindia.in/api`; the value was checked to end in `/api` and removed after the verification run. No API URL is hardcoded in application source.
- No live Google identity, customer session, customer photo upload, payment link, invoice, or authenticated customer data was exercised.
- The hosted unauthenticated `/users/me` response was an empty HTTP 403 instead of the Node source's anticipated 401 envelope. The Axios interceptor now refreshes once for a 403 only when the original request carried a bearer token; it does not treat a generic unauthenticated 403 as a session refresh trigger.
- The hosted enquiry validation result differs from the inspected Node source. Do not treat a successful enquiry submission as production-verified until the staging Node deployment/proxy returns the required HTTP 400 error envelope for an invalid payload.

## Isolated Node-staging API update — 2026-09-26

- The staging Node API now passed API-level checks for public catalogue/content,
  authenticated marked-USER ownership flows, bucket list, trips, payments,
  invoice, notifications, recently viewed, profile, and travel-photo lifecycle.
  These are not device checks and did not use a real Google identity.
- Node now returns the required 400 error envelope for empty enquiry input and
  401/403 JSON authorization envelopes in direct staging API checks. The old
  hosted production/proxy discrepancy remains a deployment gate, not a mobile
  code change.
- This pass: mobile `typecheck` and `lint` passed. Expo Doctor did not produce
  a completion result after two host attempts and is **HOST BLOCKED**. A later
  Android JS export completed successfully; its temporary output was removed.
- Android and iOS Google client audiences are still required before native
  Google authentication can be verified.

## Mobile staging-test readiness — 2026-09-26

- [x] Mobile → Node API → `node-staging` is the only supported data path.
  Source/config scans found no mobile database credential, Neon host, server
  secret, direct database client, or production API target.
- [x] Central API configuration now requires an absolute `/api` URL and HTTPS
  in release runtime. There is no preview-to-production fallback.
- [x] Ignored local/staging/production environment templates and explicit EAS
  development/preview/production environment profiles are documented.
- [x] Public staging smoke harness added. It refuses the production host before
  requesting anything and sends only validation-failure POSTs.
- [x] Native Google sign-in is disabled gracefully when its platform-specific
  public client ID is absent; no test identity or auth bypass is present.
- [x] Customer-safe API error mapping covers timeout, offline, 400, 401, 403,
  404, and 5xx states. The one-refresh/one-retry guard remains in force.
- [x] Android JS export — BUILD VERIFIED on 2026-09-26; temporary output
  removed.
- [x] Staging target smoke — LIVE STAGING API VERIFIED on 2026-09-26:
  health, public content, package/category detail, gallery, notifications and
  safe enquiry/chatbot validation passed against the Vercel staging API.
- [ ] Physical-device staging test — requires approved EAS project linking,
  preview environment/signing, Android/iOS OAuth IDs, and device/emulator access.

See `MOBILE_STAGING_SETUP.md` and `PRE_TESTING_READINESS.md` for the exact
safe setup and remaining gates.
