# Push Notification Plan

Push notifications are intentionally not enabled in v1. The application keeps notification UI/API separate so Expo push can be added without changing customer screens.

1. Request notification permission only after a customer action that explains the value (for example, “Receive trip updates”).
2. Obtain an Expo push token with `expo-notifications`, scoped to the configured EAS project.
3. Add a Node API endpoint such as `PUT /users/me/device-tokens` accepting `{ expoPushToken, platform, appVersion }`; authenticate it as the current USER only.
4. Add a `user_device_tokens` table with a user foreign key, encrypted/appropriately protected token value, platform, last-seen timestamp, disabled timestamp, and a unique token constraint.
5. Send through the Expo Push API from a server-side notification-delivery service; record tickets/receipts and disable invalid tokens.
6. Delete or revoke the current device token during logout, account disablement, and receipt-confirmed invalidation.
7. Respect iOS/Android permission state, notification categories, deep-link validation, and an opt-out preference. Never place Expo access credentials in the mobile app.

The database and Node API are deliberately unchanged until this plan is explicitly authorized.
