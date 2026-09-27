import { useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { GOOGLE_CLIENT_IDS } from "@/src/constants/config";
import { useAuth } from "@/src/auth/AuthProvider";
import { PrimaryButton } from "@/src/components/Form";
import { safeErrorMessage } from "@/src/utils/format";

type Props = { onError: (message: string) => void };

export function GoogleSignInButton({ onError }: Props) {
  const { loginWithGoogle } = useAuth();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(GOOGLE_CLIENT_IDS);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.authentication?.idToken || response.params?.id_token;
    if (!idToken) {
      onError("Google did not return an identity token. Check the OAuth client configuration.");
      return;
    }
    void (async () => {
      try {
        setWorking(true);
        await loginWithGoogle(idToken);
        router.back();
      } catch (error) {
        onError(safeErrorMessage(error, "Google sign-in could not be completed."));
      } finally {
        setWorking(false);
      }
    })();
  }, [loginWithGoogle, onError, response]);

  return <PrimaryButton title={working ? "Signing in…" : "Continue with Google"} disabled={!request || working} onPress={() => { void promptAsync(); }} />;
}
