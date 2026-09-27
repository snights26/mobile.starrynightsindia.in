# Mobile staging setup

## Architecture boundary

```text
Starry Nights mobile app → Node API staging host → node-staging Neon branch
```

The mobile app never connects to Neon/PostgreSQL. It contains no database URL,
database credentials, Node JWT secret, SMTP credential, Cloudinary API secret,
Razorpay secret, or webhook secret. It sends customer requests only through
the centralized Axios client in `src/api/client.ts`; feature services use
relative API paths from `src/api/services.ts`.

## Environment files and EAS environments

Environment files are templates only. Actual local files are ignored by Git.
Only `EXPO_PUBLIC_*` values are allowed, because Expo embeds them in the app
bundle.

| Context | Template / EAS environment | Required API value | Notes |
| --- | --- | --- | --- |
| Local development | `.env.local.example` → ignored `.env.local` | `http://<local-or-LAN-node-host>:8080/api` or HTTPS equivalent | HTTP is accepted only while running a development bundle. Never use this for preview or production. |
| Staging | `.env.staging.example` or EAS `preview` | `https://node-api-starrynightsindia-in.vercel.app/api` | Preview must use this staging-only HTTPS API. |
| Production | `.env.production.example` for reference; EAS `production` for builds | `https://api.starrynightsindia.in/api` | Configure in EAS; do not create a committed local production file. |

`src/constants/config.ts` rejects a missing, malformed, credential-bearing, or
non-`/api` target. Release bundles require HTTPS. There is no source fallback
to a production hostname: a missing preview variable produces a clear
configuration error instead of silently contacting production.

The committed `eas.json` explicitly selects EAS environments:

- `development` → `development`
- `preview` → `preview` (staging only)
- `production` → `production`

Set the following public values in the matching EAS environment, not in
`eas.json`:

```text
EXPO_PUBLIC_API_BASE_URL=https://node-api-starrynightsindia-in.vercel.app/api
EXPO_PUBLIC_WEB_BASE_URL=https://node-starrynightsindia-in.vercel.app
EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=false
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

Do not define a preview API value in the EAS `production` environment or a
production API value in `preview`. EAS profile environment selection and the
missing-value guard prevent an accidental built-in fallback, but the EAS
operator remains responsible for assigning each value to the correct
environment.

## Google sign-in

The Node API now accepts `GOOGLE_ALLOWED_CLIENT_IDS` server-side. Mobile reads
the existing public Web, Android, iOS, and optional Expo client-ID variables.
It never contains an OAuth client secret.

- Web login requires `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
- Android native Credential Manager login requires **both**
  `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (the requested ID-token audience) and
  `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (the package/signing identity for
  `com.starrynightsindia.app`). The Android value is not substituted for the
  Web client ID.
- iOS login requires `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` for
  `com.starrynightsindia.app`.
- Until a platform-specific ID exists, its native login control displays a
  configuration state rather than starting an invalid OAuth request. Android
  uses `react-native-nitro-google-signin` with the platform Credential Manager;
  it does not use Expo AuthSession or Chrome Custom Tabs. Web keeps its existing
  AuthSession implementation. iOS remains disabled pending an iOS client ID
  and reversed URL scheme.

The staging USER fixture is an API-level test fixture only. It proves neither
Google identity issuance nor a mobile auth bypass, and no fixture token belongs
in the app or repository.

## Staging smoke test

Run the public compatibility check from PowerShell:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = "https://node-api-starrynightsindia-in.vercel.app/api"
npm run staging:smoke
Remove-Item Env:EXPO_PUBLIC_API_BASE_URL
```

The script checks health, catalogue, category, package detail, home content,
gallery, public notifications, and safe 400 validation for enquiry/chatbot.
It refuses `api.starrynightsindia.in` before making a request, so it cannot run
against production. It does not use an authenticated token or create normal
enquiries/chatbot interactions. `STAGING_SMOKE_ALLOW_HTTP=true` is allowed
only for an isolated local/LAN Node API during development.

## Preview build and physical-device checklist

1. The project is linked to `@starrynightss-team/starry-nights-mobile`. The
   EAS `preview` environment contains the public staging API value above.
   The preview profile creates an internally distributed Android APK; it does
   not submit to Google Play. The Preview environment must contain the staging
   API plus the approved public Android and Web OAuth client IDs.
2. Run `eas build --profile preview --platform android` for subsequent Android
   preview builds. Do not use the production profile for this test.

### Anonymous/public

- Cold launch; tab and Android-back navigation; safe areas and keyboard.
- Home hero, featured content, statistics, packages, package detail,
  categories, gallery, contact/about/legal and HTTPS image loading.
- Loading, empty and server-error states; airplane/offline mode followed by
  retry after restoring connectivity. Confirm requests target only the staging
  API URL above.
- Enquiry validation, chatbot request/validation when enabled, and external
  phone/email/map/deep links.

### Authentication and customer flows

- **Google native login: PENDING PHYSICAL DEVICE** on the next Preview APK.
  Verify the Android Credential Manager account chooser opens without Chrome,
  then validate the backend session, refresh, reload persistence, and logout.
- With an approved server-issued staging session only, verify profile, bucket
  list, recently viewed, tours, payments, invoice, notifications and travel
  photos. The staging fixture proves API contracts only, not Google login.
- For Razorpay, open only a server-issued HTTPS `razorpayShortUrl`, cancel or
  return, and confirm the app refetches `/my-payments`. Browser return is not
  payment success; Node webhook/reconciliation remains authoritative.

## Remaining external configuration

- iOS Google OAuth client ID, Apple Developer signing, and TestFlight setup.
- Physical Android acceptance of the next native-Google Preview APK.
