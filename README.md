# Starry Nights Mobile

Native customer app for the existing Starry Nights Node API. It is built with Expo, React Native, TypeScript, Expo Router, Axios, TanStack Query, and Expo SecureStore.

## Run locally

```powershell
cd F:\www.starrynightsindia.in\mobile.starrynightsindia.in
Copy-Item .env.local.example .env.local
# Edit EXPO_PUBLIC_API_BASE_URL first; it must include /api.
npm install
npm start
```

Useful commands:

```powershell
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
npm run doctor
```

## Configuration

Only public values belong in `.env.local` or EAS environments. Never add JWT secrets, database credentials, Google client secrets, Razorpay keys/secrets, Cloudinary secrets, SMTP credentials, or webhook secrets.

`EXPO_PUBLIC_API_BASE_URL` is required and should point to the existing Node API context, e.g. `https://your-api-host/api`.

Google sign-in also requires public OAuth client IDs and compatible Node `GOOGLE_AUTH_ENABLED` / `GOOGLE_ALLOWED_CLIENT_IDS` configuration. Native Android/iOS login is intentionally disabled until its own platform client ID is configured. See `MOBILE_BACKEND_GAPS.md` before production builds.

## Android / iOS / EAS

- Android application ID: `com.starrynightsindia.app`; create and register an Android OAuth client and Android signing key fingerprint before a release build.
- iOS bundle ID: `com.starrynightsindia.app`; an Apple Developer account, provisioning profile, and iOS OAuth client are required for device/TestFlight builds.
- Set an actual EAS project ID in `app.json` after `eas init`; do not store credentials in `eas.json`.
- Use EAS environment/secrets for build-only configuration. Client values still need the `EXPO_PUBLIC_` prefix; server secrets must stay on the Node host.

The `development`, `preview`, and `production` profiles are defined in `eas.json`. Nothing publishes automatically.

## API and release notes

- `MOBILE_API_COMPATIBILITY.md` lists every route used.
- `MOBILE_BACKEND_GAPS.md` records source-inspected limitations without changing Node.
- `PUSH_NOTIFICATION_PLAN.md` describes the deferred push design.
- `MOBILE_STATUS.md` distinguishes implemented from verified work.
- `MOBILE_STAGING_SETUP.md` explains safe local, EAS preview/staging, and production configuration.
