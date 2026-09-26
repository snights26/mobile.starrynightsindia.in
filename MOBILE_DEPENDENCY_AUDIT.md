# Mobile Dependency Audit — 2026-09-25

`npm audit --omit=dev --json` reported **15 moderate** and **2 high** advisories for the Expo SDK 54 dependency graph. There are no critical findings. No dependency was upgraded during this verification pass.

## Reachability assessment

| Finding family | Production Android/iOS binary reachability | Assessment |
| --- | --- | --- |
| `image-size` (high), `postcss` (high), `xcode`, `uuid` through `xcode` | Not expected in the shipped mobile binary | These are Node-side image, CSS, Xcode/config/prebuild dependencies used by Expo tooling. This app does not package the Node CLI, PostCSS processor, or Xcode project parser into an Android/iOS binary. They remain relevant to a developer or CI build environment, which should only process trusted repositories/assets. |
| `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/metro-config`, `@expo/prebuild-config` | Tooling / build-time, not an application feature path | Expo-managed build and Metro configuration dependencies. They are not direct application imports, but should be updated through a supported Expo SDK upgrade rather than independently overridden. |
| `expo`, `expo-asset`, `expo-constants`, `expo-auth-session`, `expo-linking`, `expo-router`, `query-string`, `decode-uri-component` | Potential shared JavaScript/runtime footprint; exact vulnerable code path was not demonstrated | These are Expo-managed mobile dependencies or direct framework packages. The audit report does not prove a reachable app-specific exploit path, so they cannot be marked unreachable. Treat them as upstream SDK risk and upgrade as a coordinated Expo release. |

The audit's proposed fixes are major-line updates (`expo@57.0.25` and related `expo-router`/auth-session versions). Forcing individual transitive overrides or running `npm audit fix --force` would break Expo's version matrix and is not a safe remediation.

## Supported remediation path

1. Create a dedicated upgrade branch/worktree after internal Android verification of SDK 54.
2. Read the Expo SDK 55, 56, and 57 upgrade notes; upgrade one SDK at a time with `npx expo install expo@~<target>` and `npx expo install --fix` so React Native and Expo modules stay compatible.
3. Regenerate the lockfile only through that supported install flow. Do not add ad-hoc `overrides` for Expo internals unless Expo explicitly recommends one.
4. Re-run `npx expo-doctor`, TypeScript, lint, Android/iOS bundle exports, native development builds, Google sign-in, deep links, SecureStore restore, image picker, and the hosted-payment browser return flow.
5. Re-run `npm audit --omit=dev`; inspect the new production dependency tree before promoting an EAS build.

Until then, protect local/EAS build infrastructure, do not feed untrusted CSS/source-map/image metadata into developer tooling, and keep the working SDK 54 application unchanged.
