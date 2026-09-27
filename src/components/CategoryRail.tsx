import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Section } from "@/src/components/Section";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import type { Category } from "@/src/types/api";
import { resolveAssetUrl } from "@/src/utils/assets";

type Props = { categories: Category[]; title?: string; limit?: number };

export function CategoryRail({ categories, title = "Browse by destination", limit = 12 }: Props) {
  const theme = useAppTheme();
  const rootCategories = categories.filter((item) => !item.isSubcategory && !item.isSub).slice(0, limit);
  if (!rootCategories.length) return null;

  return <Section title={title} action={<Pressable onPress={() => router.push("/(tabs)/explore")} accessibilityRole="button"><Text style={{ color: theme.colors.accent, fontWeight: "700" }}>See all</Text></Pressable>}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {rootCategories.map((item) => {
        const image = resolveAssetUrl(item.image || item.thumbnailUrl);
        return <Pressable key={item.code || item.categoryCode} onPress={() => router.push({ pathname: "/category/[code]", params: { code: item.code || item.categoryCode, name: item.name || item.title } })} accessibilityRole="button" accessibilityLabel={`Browse ${item.name || item.title}`} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {image ? <ImageBackground source={{ uri: image }} style={styles.image} imageStyle={{ borderRadius: radius.md }}><View style={styles.shade}><Text numberOfLines={2} style={styles.name}>{item.name || item.title}</Text></View></ImageBackground> : <View style={styles.fallback}><Text numberOfLines={2} style={[styles.fallbackText, { color: theme.colors.text }]}>{item.name || item.title}</Text></View>}
        </Pressable>;
      })}
    </ScrollView>
  </Section>;
}

const styles = StyleSheet.create({
  rail: { gap: spacing.sm, paddingRight: spacing.md },
  card: { width: 168, height: 116, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" },
  image: { flex: 1 },
  shade: { flex: 1, justifyContent: "flex-end", padding: spacing.sm, backgroundColor: "rgba(0,0,0,.32)" },
  name: { color: "#fff", fontSize: 15, fontWeight: "800" },
  fallback: { flex: 1, justifyContent: "flex-end", padding: spacing.sm },
  fallbackText: { fontSize: 15, fontWeight: "800" },
});
