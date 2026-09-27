import { useState } from "react";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "react-native-nitro-google-signin";
import { router } from "expo-router";
import { GOOGLE_CLIENT_IDS } from "@/src/constants/config";
import { useAuth } from "@/src/auth/AuthProvider";
import { PrimaryButton } from "@/src/components/Form";
import { safeErrorMessage } from "@/src/utils/format";

type Props = { onError: (message: string) => void };

let configuredWebClientId: string | undefined;

function configureNativeGoogleSignIn(webClientId: string) {
  if (configuredWebClientId === webClientId) return;
  GoogleOneTapSignIn.configure({ webClientId });
  configuredWebClientId = webClientId;
}

function nativeGoogleErrorMessage(error: unknown): string {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return "Google Play services is unavailable. Update it and try again.";
    if (error.code === statusCodes.DEVELOPER_ERROR) return "Google sign-in is not available for this Android build. Please contact support.";
    if (error.code === statusCodes.IN_PROGRESS) return "Google sign-in is already in progress.";
  }
  return safeErrorMessage(error, "Google sign-in could not be completed.");
}

export function GoogleSignInButton({ onError }: Props) {
  const { loginWithGoogle } = useAuth();
  const [working, setWorking] = useState(false);

  const signIn = async () => {
    const webClientId = GOOGLE_CLIENT_IDS.webClientId;
    if (!webClientId) {
      onError("Google sign-in is not configured for this Android build.");
      return;
    }

    try {
      setWorking(true);
      onError("");
      configureNativeGoogleSignIn(webClientId);
      await GoogleOneTapSignIn.checkPlayServices();
      const response = await GoogleOneTapSignIn.presentExplicitSignIn();
      if (isCancelledResponse(response)) return;
      if (!isSuccessResponse(response) || !response.data.idToken) {
        onError("Google did not return an identity token. Please try again.");
        return;
      }
      await loginWithGoogle(response.data.idToken);
      router.back();
    } catch (error) {
      onError(nativeGoogleErrorMessage(error));
    } finally {
      setWorking(false);
    }
  };

  return <PrimaryButton title={working ? "Signing in…" : "Continue with Google"} disabled={working} onPress={() => { void signIn(); }} />;
}
