import { ComponentProps, ReactNode, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";

export function Field({ label, children }: { label: string; children: ReactNode }) { const theme = useAppTheme(); return <View style={styles.field}><Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>{children}</View>; }
export function AppInput({ style, ...props }: ComponentProps<typeof TextInput>) { const theme = useAppTheme(); return <TextInput {...props} placeholderTextColor={theme.colors.muted} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]} />; }
export function PrimaryButton({ title, onPress, disabled, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) { const theme = useAppTheme(); return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, { backgroundColor: secondary ? theme.colors.soft : theme.colors.accent, opacity: disabled ? .55 : 1 }]}><Text style={[styles.buttonText, { color: secondary ? theme.colors.text : "#fff" }]}>{title}</Text></Pressable>; }
export function ChoiceChips({ values, selected, onChange }: { values: string[]; selected: string; onChange: (value: string) => void }) { const theme = useAppTheme(); return <View style={styles.chips}>{values.map((value) => <Pressable key={value} onPress={() => onChange(value)} style={[styles.chip, { borderColor: selected === value ? theme.colors.accent : theme.colors.border, backgroundColor: selected === value ? theme.colors.accentSoft : theme.colors.surface }]}><Text style={{ color: selected === value ? theme.colors.accentStrong : theme.colors.text }}>{value}</Text></Pressable>)}</View>; }

export type SelectOption = { label: string; value: string };

/** A native modal select: no hidden TextInput means Android never opens the keyboard for enum fields. */
export function AppSelect({ value, options, placeholder = "Select an option", onChange, disabled = false, accessibilityLabel }: { value?: string; options: SelectOption[]; placeholder?: string; onChange: (value: string) => void; disabled?: boolean; accessibilityLabel: string }) {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);
  const label = selected?.label || value || placeholder;
  return <>
    <Pressable disabled={disabled} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ expanded: open, disabled }} style={[styles.select, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: disabled ? .62 : 1 }]}>
      <Text numberOfLines={1} style={[styles.selectText, { color: selected || value ? theme.colors.text : theme.colors.muted }]}>{label}</Text>
      <Text accessibilityElementsHidden style={[styles.selectChevron, { color: theme.colors.muted }]}>⌄</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.selectModal}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close options" onPress={() => setOpen(false)} style={styles.selectBackdrop} />
        <View accessibilityViewIsModal style={[styles.selectSheet, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.selectSheetHeader, { borderBottomColor: theme.colors.border }]}><Text style={[styles.selectSheetTitle, { color: theme.colors.text }]}>{accessibilityLabel}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close options" onPress={() => setOpen(false)} hitSlop={8}><Text style={[styles.selectClose, { color: theme.colors.muted }]}>×</Text></Pressable></View>
          <ScrollView contentContainerStyle={styles.selectOptions} keyboardShouldPersistTaps="handled">
            {options.map((option) => {
              const isSelected = option.value === value;
              return <Pressable key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} accessibilityRole="radio" accessibilityState={{ selected: isSelected }} style={[styles.selectOption, { backgroundColor: isSelected ? theme.colors.accentSoft : "transparent" }]}><Text style={{ color: isSelected ? theme.colors.accentStrong : theme.colors.text, fontWeight: isSelected ? "800" : "600" }}>{option.label}</Text>{isSelected ? <Text style={{ color: theme.colors.accentStrong, fontWeight: "900" }}>✓</Text> : null}</Pressable>;
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  field: { gap: 6 }, label: { fontSize: 14, fontWeight: "700" }, input: { borderWidth: 1, borderRadius: radius.sm, minHeight: 48, paddingHorizontal: spacing.sm, fontSize: 16 }, button: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, paddingHorizontal: spacing.lg }, buttonText: { fontSize: 16, fontWeight: "800" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }, chip: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 13 },
  select: { minHeight: 48, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm }, selectText: { flex: 1, fontSize: 16 }, selectChevron: { fontSize: 24, lineHeight: 20, fontWeight: "800" },
  selectModal: { flex: 1, justifyContent: "flex-end" }, selectBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,.46)" }, selectSheet: { maxHeight: "68%", borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderWidth: 1, overflow: "hidden" }, selectSheetHeader: { minHeight: 58, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth }, selectSheetTitle: { fontSize: 17, fontWeight: "800" }, selectClose: { fontSize: 30, lineHeight: 30, fontWeight: "400" }, selectOptions: { padding: spacing.xs, gap: 2 }, selectOption: { minHeight: 50, borderRadius: radius.sm, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
});
