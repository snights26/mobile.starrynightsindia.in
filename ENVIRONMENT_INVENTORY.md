# Mobile Environment and Release Inventory

Source of truth: all `process.env.EXPO_PUBLIC_*` reads, `app.json`, `eas.json`,
and `.env.example`, inspected on 2026-09-25. `EXPO_PUBLIC_*` values are embedded
in the mobile JavaScript bundle and are visible to app users; none may contain a
secret.

## Public build environment

| Variable | Classification / default | Development | Staging | Production | Purpose | Current status / test |
| --- | --- | --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | **PUBLIC SAFE, REQUIRED BUILD-TIME**; empty source fallback | local API ending `/api` | `https://node-api-starrynightsindia-in.vercel.app/api` | production Node API ending `/api` | Axios API base. App reports a clear configuration error when missing. | staging template and EAS `preview` environment are configured and verified. |
| `EXPO_PUBLIC_WEB_BASE_URL` | **PUBLIC SAFE, OPTIONAL BUILD-TIME**; empty | local public web URL if testing policy links/share URLs | staging public URL | production public URL | Resolves website policy/package links; absent disables those links safely. | example placeholder only. |
| `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED` | **PUBLIC SAFE, OPTIONAL BUILD-TIME**; `false` unless literal `true` | false until local OAuth is registered | true only with staging clients | true only with production clients | Gates platform Google sign-in UI. | Preview configured; Android physical acceptance pending. |
| `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` | **PUBLIC SAFE, OPTIONAL** | Expo Go client if that flow is deliberately tested | normally omit for EAS standalone app | normally omit for EAS standalone app | Expo Go OAuth audience only. | unset; not required for internal/production standalone builds. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | **PUBLIC SAFE, REQUIRED when Android Google sign-in is enabled** | registered debug Android client if used | registered staging Android client | registered production Android client | Android package/signing identity; the Node allowlist retains this audience. | staging Preview configured; physical acceptance pending. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | **PUBLIC SAFE, REQUIRED when iOS Google sign-in is enabled** | registered iOS client if used | registered staging iOS client | registered production iOS client | iOS OAuth audience; must be in Node `GOOGLE_ALLOWED_CLIENT_IDS`. | missing; needs creation/user input. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | **PUBLIC SAFE, REQUIRED when Google is enabled** | registered Web client | staging Web client | production Web client | Web AuthSession audience on web and requested ID-token audience for Android Credential Manager; must be in Node allowlist. | staging Preview configured without committing its value. |

Never put a JWT secret, Google client secret, database URL, Razorpay secret or
webhook secret, SMTP password, or Cloudinary API secret in `EXPO_PUBLIC_*`,
`app.json`, or `eas.json`.

## App and EAS configuration

| Field | Requirement / status |
| --- | --- |
| `expo.name`, `slug`, `version` | Set to `Starry Nights`, `starry-nights-mobile`, and `1.0.0`; bump version for store releases. |
| `expo.scheme` | Set to `starrynights`; verify OAuth/browser-return redirect behavior on Android and iOS devices. |
| Android `package` | Set to `com.starrynightsindia.app`; reserve/verify before Play submission. |
| Android `versionCode` | Set to `1`; EAS production auto-increment is enabled. Verify remote increment behavior before the first release. |
| iOS `bundleIdentifier` | Set to `com.starrynightsindia.app`; must be registered in Apple Developer and Google OAuth. |
| iOS `buildNumber` | Set to `1`; EAS production auto-increment is enabled. Verify before first TestFlight submission. |
| App icon / Android adaptive icon | Existing 980×980 Starry Nights asset is wired as `icon` and adaptive foreground image in this pass. Visual/store review is still required on physical Android/iOS devices. |
| Image picker | `expo-image-picker` plugin and iOS photo permission text are set. Android uses the platform photo picker; live permission behavior remains device testing. |
| SecureStore | `expo-secure-store` plugin is set; session code uses `WHEN_UNLOCKED_THIS_DEVICE_ONLY`. |
| Router/deep links | Expo Router plus `starrynights` scheme configured. Android Google uses Credential Manager rather than a custom browser redirect; iOS provider setup remains pending. |
| EAS project ID | Linked to `@starrynightss-team/starry-nights-mobile` with public project ID `bb8c3025-ba56-4234-af08-50b8f72eee44`. |
| `eas.json` | Development/preview internal distribution and production auto-increment profiles exist. Credentials/signing values are intentionally absent and must be held by EAS/Apple/Google, not source. |

## Expo SDK decision

Current compatible set is Expo SDK 54 (`expo ~54.0.0`), React Native 0.81,
Expo Router 6, SecureStore 15, AuthSession 7 (web only), Image Picker 17,
Nitro Google Sign-In 2.3.0, and Nitro Modules 0.37.1. The prior
production-only audit reports 15 moderate and 2 high upstream SDK/tooling
advisories with no demonstrated app-specific runtime exploit and no critical
finding. Available audit remediation requires a coordinated major Expo upgrade
(55→56→57), not a safe `npm audit fix --force`.

**Recommendation A — test current SDK first, then upgrade in a dedicated
upgrade task.** SDK 54 has already passed TypeScript, lint and an Android
bundle export; Expo Doctor remains host-inconclusive. An upgrade now would
expand the unverified surface before
the first device/auth/browser/image-picker test. After internal device testing,
upgrade one supported SDK at a time via `expo install`, then rerun Doctor,
typecheck, lint, Android/iOS exports, router, SecureStore, AuthSession and image
picker verification before release promotion.
