import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { customerApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { AppInput, Field, PrimaryButton } from "@/src/components/Form";
import { AuthGate } from "@/src/components/AuthGate";
import { Screen } from "@/src/components/Screen";
import { spacing, useAppTheme } from "@/src/theme/theme";
import { safeErrorMessage } from "@/src/utils/format";
import type { User } from "@/src/types/api";

type FieldKey = "name" | "contact" | "city" | "state" | "country" | "pincode" | "dob" | "gender" | "preferredDestinations" | "preferredTravelStyle" | "travelPreferences" | "emergencyName" | "emergencyContact";
const inputs: { key: FieldKey; label: string; placeholder?: string; keyboardType?: "default" | "phone-pad" }[] = [
  { key: "name", label: "Full name" }, { key: "contact", label: "Mobile number", keyboardType: "phone-pad" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "country", label: "Country" }, { key: "pincode", label: "Pincode", keyboardType: "phone-pad" }, { key: "dob", label: "Date of birth (YYYY-MM-DD)" }, { key: "gender", label: "Gender" }, { key: "preferredDestinations", label: "Preferred destinations" }, { key: "preferredTravelStyle", label: "Preferred travel style" }, { key: "travelPreferences", label: "Travel preferences" }, { key: "emergencyName", label: "Emergency contact name" }, { key: "emergencyContact", label: "Emergency contact number", keyboardType: "phone-pad" },
];
export default function ProfileEditScreen() {
  const theme = useAppTheme(); const { user, isAuthenticated, reloadUser } = useAuth(); const [form, setForm] = useState<Partial<User>>({}); const [saving, setSaving] = useState(false);
  useEffect(() => { if (user) setForm(user); }, [user]);
  if (!isAuthenticated || !user) return <Screen><AuthGate /></Screen>;
  const submit = async (complete = false) => { if (!form.name?.trim() || !form.contact?.trim()) { Alert.alert("Missing details", "Name and mobile number are required."); return; } try { setSaving(true); const updated = complete ? await customerApi.completeProfile(form) : await customerApi.updateProfile(user, form); await reloadUser(); Alert.alert("Profile saved", updated.profileCompleted ? "Your travel profile is complete." : "Your profile has been updated."); router.back(); } catch (error) { Alert.alert("Could not save profile", safeErrorMessage(error)); } finally { setSaving(false); } };
  return <Screen><Text style={[styles.intro, { color: theme.colors.muted }]}>Keep your details current so your team can prepare travel documents and contact you about your trip.</Text>{inputs.map((input) => <Field label={input.label} key={input.key}><AppInput value={String(form[input.key] ?? "")} onChangeText={(value) => setForm((current) => ({ ...current, [input.key]: value }))} placeholder={input.placeholder} keyboardType={input.keyboardType} /></Field>)}<View style={styles.buttons}><PrimaryButton title={saving ? "Saving…" : "Save profile"} disabled={saving} onPress={() => void submit(false)} />{!user.profileCompleted ? <PrimaryButton title="Save and complete profile" disabled={saving} secondary onPress={() => void submit(true)} /> : null}</View></Screen>;
}
const styles = StyleSheet.create({ intro: { lineHeight: 20, marginBottom: spacing.xs }, buttons: { gap: spacing.sm, marginTop: spacing.sm } });
