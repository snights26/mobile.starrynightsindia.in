import { View } from "react-native";

type Props = { onError: (message: string) => void };

// iOS stays intentionally unavailable until an iOS OAuth client and URL scheme are configured.
export function GoogleSignInButton(_: Props) {
  return <View />;
}
