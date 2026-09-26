import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/src/api/services";
import { useAuth } from "@/src/auth/AuthProvider";
import { AuthGate } from "@/src/components/AuthGate";
import { PrimaryButton } from "@/src/components/Form";
import { Screen } from "@/src/components/Screen";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/StateViews";
import { radius, spacing, useAppTheme } from "@/src/theme/theme";
import { resolveAssetUrl } from "@/src/utils/assets";
import { safeErrorMessage } from "@/src/utils/format";
import { uploadToAuthorizedBlob } from "@/src/services/vercelBlobUpload";
import { useState } from "react";

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxUploadBytes = 25 * 1024 * 1024;

export default function MyPhotosScreen() {
  const theme = useAppTheme(); const { isAuthenticated } = useAuth(); const photos = useQuery({ queryKey: ["my-photos"], queryFn: customerApi.photos, enabled: isAuthenticated }); const [uploading, setUploading] = useState(false);
  const choose = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Photo access needed", "Allow photo access to choose a travel photo."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: .7, base64: false });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType || "";
    const file = new File(asset.uri);
    const size = asset.fileSize ?? file.size;
    const filename = asset.fileName || file.name || `travel-photo-${Date.now()}.jpg`;
    if (!acceptedImageTypes.has(mimeType)) { Alert.alert("Unsupported photo", "Choose a JPEG, PNG, or WebP image."); return; }
    if (!Number.isSafeInteger(size) || size < 1 || size > maxUploadBytes) { Alert.alert("Photo is too large", "Choose an image smaller than 25 MB."); return; }
    try {
      setUploading(true);
      const authorization = await customerApi.authorizePhotoUpload({ filename, contentType: mimeType, size });
      const uploaded = await uploadToAuthorizedBlob({ authorization, body: file, contentType: mimeType });
      await customerApi.finalizePhotoUpload({ intent: authorization.intent, url: uploaded.url, title: filename });
      await photos.refetch();
      Alert.alert("Photo uploaded", "Your photo has been saved. It is not public unless the Starry Nights team approves and features it.");
    } catch (error) { Alert.alert("Upload failed", safeErrorMessage(error)); } finally { setUploading(false); }
  };
  const remove = (id: string) => Alert.alert("Delete photo?", "This removes the photo from your account gallery.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { void customerApi.deletePhoto(id).then(() => photos.refetch()).catch((error) => Alert.alert("Could not delete photo", safeErrorMessage(error))); } }]);
  if (!isAuthenticated) return <Screen><AuthGate title="Your travel photos" message="Sign in to add and manage photos associated with your account." /></Screen>;
  if (photos.isLoading) return <Screen><LoadingView label="Loading your photos…" /></Screen>;
  if (photos.isError) return <Screen><ErrorView retry={() => photos.refetch()} message="Your photo gallery could not be loaded." /></Screen>;
  return <Screen scroll={false}><FlatList data={photos.data} keyExtractor={(item) => item.id} numColumns={2} contentContainerStyle={styles.list} columnWrapperStyle={styles.row} renderItem={({ item }) => <View style={[styles.photo, { backgroundColor: theme.colors.soft }]}>{resolveAssetUrl(item.image || item.url) ? <Image source={{ uri: resolveAssetUrl(item.image || item.url) }} style={styles.image} /> : null}<Pressable onPress={() => remove(item.id)} style={styles.delete}><Text style={styles.deleteText}>Delete</Text></Pressable></View>} ListHeaderComponent={<View style={styles.header}><Text style={{ color: theme.colors.muted }}>Photos you upload are private by default. Existing API approval and public-feature consent remain server-controlled.</Text><PrimaryButton title={uploading ? "Uploading…" : "Choose photo"} disabled={uploading} onPress={() => void choose()} /></View>} ListEmptyComponent={<EmptyView title="No travel photos yet" message="Choose a photo to add it to your private account gallery." />} /></Screen>;
}
const styles = StyleSheet.create({ list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 60 }, row: { gap: spacing.sm }, header: { gap: spacing.md, paddingBottom: spacing.sm }, photo: { flex: 1, aspectRatio: 1, borderRadius: radius.md, overflow: "hidden" }, image: { width: "100%", height: "100%" }, delete: { position: "absolute", bottom: 7, right: 7, backgroundColor: "rgba(0,0,0,.72)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill }, deleteText: { color: "#fff", fontWeight: "800", fontSize: 12 } });
