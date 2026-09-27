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

- [x] Google authentication — Web continues with Google Identity Services; Android uses native Credential Manager through `react-native-nitro-google-signin` 2.3.0 and sends its ID token to the existing Node API — LIVE STAGING VERIFIED by the owner on Preview build `313e7824-6048-421f-8be1-b45b71274322`
- [x] Session restore, automatic refresh, invalid-session cleanup — IMPLEMENTED / session persistence RUNTIME VERIFIED; owner verified the normal Google session flow without a test bypass
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
- [x] Expo Doctor — BUILD VERIFIED on 2026-09-27 (18/18 checks passed after installing Expo Router's direct `expo-constants` peer and aligning React Native to SDK 54 patch 0.81.5)
- [x] Android JS bundle export — BUILD VERIFIED on 2026-09-27 with the verified staging API environment loaded
- [x] Metro startup smoke test — RUNTIME VERIFIED on 2026-09-25 (Metro served HTTP 200 on localhost)
- [x] Public API compatibility — LIVE STAGING API VERIFIED on `https://node-api-starrynightsindia-in.vercel.app/api`; read-only home, catalogue, category, package-detail, gallery and public-notification calls returned the standard success envelope
- [x] Chatbot invalid-request validation — LIVE API VERIFIED (HTTP 400, no interaction created)
- [x] Auth/session safety paths — BUILD VERIFIED by implementation and Android bundle review: SecureStore only, guarded queries, a single 401/bearer-403 refresh retry, failed-refresh cleanup and logout cleanup
- [x] Dependency audit — `npm audit --omit=dev` reports 15 moderate / 2 high upstream Expo SDK 54 ecosystem advisories. Findings and the non-disruptive upgrade path are in `MOBILE_DEPENDENCY_AUDIT.md`.
- [x] Android device launch — RUNTIME VERIFIED on physical Preview APK `313e7824-6048-421f-8be1-b45b71274322`; fresh ADB launch remained alive with no old font/native exception
- [x] iOS configuration — IMPLEMENTED; device verification pending
- [ ] Device UX checks — cold-start UI, tabs, keyboard, Android back navigation, safe areas, sharing and image rendering require an Android device/emulator

## Deliberately excluded from v1

- Push-token registration/delivery (design in `PUSH_NOTIFICATION_PLAN.md`)
- Client-side payment creation (the existing API correctly limits Razorpay-link creation to `SUPER_ADMIN`)
- Profile-avatar binary upload (there is no existing customer-safe API route; documented in `MOBILE_BACKEND_GAPS.md`)

## Verification environment

- An ignored local `.env` temporarily supplied `EXPO_PUBLIC_API_BASE_URL=https://api.starrynightsindia.in/api`; the value was checked to end in `/api` and removed after the verification run. No API URL is hardcoded in application source.
- Web Google login is LIVE STAGING VERIFIED. Android native Google login and session persistence are LIVE STAGING VERIFIED by the owner; private documents, photo lifecycle, payment link, invoice and broader customer-data screens remain feature-specific physical-device work.
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
- This pass: mobile `typecheck`, `lint`, and Android JS export passed. Expo
  Doctor initially found a missing direct `expo-constants` peer and an SDK 54
  React Native patch mismatch; both were aligned and the final Doctor run
  passed all 18 checks.
- Android now has a registered OAuth client and a native Credential Manager
  implementation. iOS remains intentionally disabled until it has its own
  client ID and reversed URL scheme.

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
- [x] Native Google sign-in uses Android Credential Manager when its public
  Android and Web client IDs are present. It has no test identity or auth
  bypass. iOS remains gracefully unavailable pending its own configuration.
- [x] Customer-safe API error mapping covers timeout, offline, 400, 401, 403,
  404, and 5xx states. The one-refresh/one-retry guard remains in force.
- [x] Android JS export — BUILD VERIFIED on 2026-09-26; temporary output
  removed.
- [x] Staging target smoke — LIVE STAGING API VERIFIED on 2026-09-26:
  health, public content, package/category detail, gallery, notifications and
  safe enquiry/chatbot validation passed against the Vercel staging API.
- [ ] Native Google physical-device acceptance — requires the next cache-cleared
  Preview APK. Android OAuth is configured; iOS OAuth remains pending.

## Android native dependency and Google migration — 2026-09-27

- The original Android startup crash was a native `NoSuchMethodError` in
  `expo.modules.font.FontLoaderModule` caused by an incompatible nested
  `expo-font` pulled by `@expo/vector-icons` 15.1.1. The fixed dependency graph
  is `@expo/vector-icons` 15.0.3, `expo-font` 14.0.12, and Expo's
  `expo-modules-core` 3.0.30. The root override keeps that font version
  deduplicated. Preview build `fed7d928-e622-4419-a2b5-ea50720a4095` confirmed
  stable startup on the physical device.
- Android browser AuthSession Google login was replaced with
  `react-native-nitro-google-signin` 2.3.0 and
  `react-native-nitro-modules` 0.37.1. This uses Android Credential Manager
  (`presentExplicitSignIn`) rather than Chrome Custom Tabs. It requests an ID
  token for the configured **Web** OAuth client, while the Android OAuth client
  continues to bind package and EAS signing SHA identity. The existing API
  remains the sole token verifier/session issuer.
- The library's Expo plugin is deliberately not applied yet: without Firebase
  it requires an iOS reversed client scheme, and iOS has no approved client.
  Android needs no `google-services.json` when `webClientId` is configured
  explicitly; React Native autolinking supplies the Android native module.
- Expo Router's direct `expo-constants` peer is installed and React Native is
  pinned to Expo SDK 54's supported 0.81.5 patch. These changes do not alter
  the locked Vector Icons/Font/Core compatibility set.
- Cache-cleared internal Preview build
  `313e7824-6048-421f-8be1-b45b71274322` is the pending native-Google
  acceptance candidate. The earlier build `6dd15eb8-061e-4008-9247-8a421b7b53b3`
  was deliberately cancelled after Expo Doctor identified the SDK alignment
  fix; it must not be installed.

See `MOBILE_STAGING_SETUP.md` and `PRE_TESTING_READINESS.md` for the exact
safe setup and remaining gates.

## Android acceptance and public-web parity — 2026-09-27

- [x] Android Preview build `313e7824-6048-421f-8be1-b45b71274322` — installed
  by the owner. The owner confirmed native Google sign-in (without Chrome), a
  successful staging session and persistence after reopening. ADB independently
  confirmed the connected device process was alive after a fresh launch with no
  `ReturnTypeKt.getDirectConverter`, `FontLoaderModule`, `ReactNativeJS`, or
  `FATAL EXCEPTION` crash; the authenticated profile rendered again after a
  force-stop/relaunch. Account selection, logout and refresh were not replayed
  by automation so as not to disturb the owner's signed-in staging session.
- [x] Public discovery parity — IMPLEMENTED: a home category rail, native
  category-tree drill-down, Global Explorer region discovery, world-time
  discovery, Trending and additional Home discovery shortcuts are now present.
  The mobile Global Explorer intentionally uses a tap-first regional rail rather
  than the desktop site's SVG map.
- [x] Full comparison matrix — source plus staging-runtime evidence is in
  `WEB_MOBILE_PARITY_AUDIT.md`. It identifies remaining non-critical product
  decisions (brands, long-form About/social content, customer-safe transport
  slips/private invoice downloads) without treating desktop markup as a mobile
  requirement.
- [ ] Android parity-device acceptance — internal Preview build
  `884c3e10-f365-40a6-ba4b-a9b5b6016087` was submitted from commit
  `973341f` for the JavaScript-only discovery changes and is currently in
  progress. No native dependency or Android configuration changed.
