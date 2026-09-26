import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { inr, readableDate } from "@/src/utils/format";
import type { Payment } from "@/src/types/api";

const safePaymentUrl = (url?: string) => Boolean(url && /^https:\/\//i.test(url));
export default function PaymentsScreen() {
  const theme = useAppTheme(); const { isAuthenticated } = useAuth(); const payments = useQuery({ queryKey: ["payments"], queryFn: customerApi.payments, enabled: isAuthenticated });
  const openLink = async (payment: Payment) => { if (!safePaymentUrl(payment.razorpayShortUrl)) { Alert.alert("Payment link unavailable", "The secure payment link is not available or has expired. Please contact Starry Nights."); return; } try { await WebBrowser.openBrowserAsync(payment.razorpayShortUrl!); await payments.refetch(); } catch { const canOpen = await Linking.canOpenURL(payment.razorpayShortUrl!); if (canOpen) await Linking.openURL(payment.razorpayShortUrl!); } };
  if (!isAuthenticated) return <Screen><AuthGate title="Your payment history" message="Sign in to view payment requests and invoices for your confirmed trips." /></Screen>;
  if (payments.isLoading) return <Screen><LoadingView label="Loading payments…" /></Screen>;
  if (payments.isError) return <Screen><ErrorView retry={() => payments.refetch()} message="Payment history could not be loaded." /></Screen>;
  return <Screen scroll={false}><FlatList data={payments.data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={[styles.payment, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><View style={styles.top}><Text style={[styles.amount, { color: theme.colors.text }]}>{inr(item.amount)}</Text><Text style={[styles.status, { color: item.paymentStatus?.toUpperCase() === "PAID" ? theme.colors.success : theme.colors.warning }]}>{item.paymentStatus || item.status || "Pending"}</Text></View><Text style={{ color: theme.colors.muted }}>{readableDate(item.paymentDate)} · {item.mode || "Payment"}</Text>{item.transactionId ? <Text style={{ color: theme.colors.muted }}>Transaction: {item.transactionId}</Text> : null}<View style={styles.actions}>{safePaymentUrl(item.razorpayShortUrl) && item.paymentStatus?.toUpperCase() === "PENDING" ? <Pressable onPress={() => void openLink(item)} style={[styles.payButton, { backgroundColor: theme.colors.accent }]}><Text style={styles.payText}>Open secure payment</Text></Pressable> : null}<Pressable onPress={() => router.push({ pathname: "/invoice/[tourId]", params: { tourId: item.tourId } })} style={[styles.invoiceButton, { borderColor: theme.colors.accent }]}><Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Invoice</Text></Pressable></View></View>} ListEmptyComponent={<EmptyView title="No payments yet" message="Payments for your confirmed tours will appear here." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, payment: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 6 }, top: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }, amount: { fontWeight: "800", fontSize: 18 }, status: { fontWeight: "800", textTransform: "uppercase", fontSize: 12 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs }, payButton: { borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: spacing.md }, payText: { color: "#fff", fontWeight: "800" }, invoiceButton: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: spacing.md } });
