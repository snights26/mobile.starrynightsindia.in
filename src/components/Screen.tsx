import { PropsWithChildren } from "react";
import { RefreshControl, ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme, spacing } from "@/src/theme/theme";

export function Screen({ children, scroll = true, onRefresh, refreshing = false, style }: PropsWithChildren<{ scroll?: boolean; onRefresh?: () => void; refreshing?: boolean; style?: StyleProp<ViewStyle> }>) {
  const theme = useAppTheme();
  const content = <>{children}</>;
  return <SafeAreaView edges={["left", "right"]} style={[styles.safe, { backgroundColor: theme.colors.background }]}>{scroll ? <ScrollView contentContainerStyle={[styles.content, style]} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} /> : undefined}>{content}</ScrollView> : content}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md } });
