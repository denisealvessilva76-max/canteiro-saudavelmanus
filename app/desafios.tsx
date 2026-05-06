import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList, Alert, Image } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const CATEGORIES = [
  { id: "pesagem", label: "⚖️ Pesagem", color: "#FF6B6B" },
  { id: "refeicao", label: "🍽️ Refeição", color: "#4ECDC4" },
  { id: "atividade", label: "🏃 Atividade", color: "#FFE66D" },
  { id: "outro", label: "📸 Outro", color: "#95E1D3" },
];

const CHALLENGES = [
  {
    id: 1,
    title: "Desafio da Semana",
    description: "Compartilhe uma foto de sua refeição saudável",
    category: "refeicao",
    points: 50,
    progress: 3,
    target: 7,
  },
  {
    id: 2,
    title: "Atividade Física",
    description: "Registre sua atividade física diária",
    category: "atividade",
    points: 30,
    progress: 5,
    target: 7,
  },
  {
    id: 3,
    title: "Pesagem Semanal",
    description: "Faça sua pesagem semanal e compartilhe",
    category: "pesagem",
    points: 20,
    progress: 1,
    target: 1,
  },
];

export default function DesafiosScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("outro");
  const [description, setDescription] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const photosStr = await AsyncStorage.getItem("user:challenge_photos");
      if (photosStr) {
        setPhotos(JSON.parse(photosStr));
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      let result;

      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível acessar a câmera/galeria");
    }
  };

  const uploadPhoto = async () => {
    if (!selectedPhoto) {
      Alert.alert("Erro", "Selecione uma foto primeiro");
      return;
    }

    setLoading(true);

    try {
      const newPhoto = {
        id: Date.now(),
        uri: selectedPhoto,
        category: selectedCategory,
        description: description || "Sem descrição",
        timestamp: new Date().toLocaleString("pt-BR"),
        points: CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Outro",
      };

      const updatedPhotos = [newPhoto, ...photos];
      await AsyncStorage.setItem("user:challenge_photos", JSON.stringify(updatedPhotos));
      setPhotos(updatedPhotos);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("✅ Sucesso", "Foto enviada com sucesso!");
      setShowUploadModal(false);
      setSelectedPhoto(null);
      setDescription("");
      setSelectedCategory("outro");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a foto");
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = (id: number) => {
    Alert.alert("Deletar", "Tem certeza que deseja deletar esta foto?", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Deletar",
        onPress: async () => {
          try {
            const updatedPhotos = photos.filter((p) => p.id !== id);
            await AsyncStorage.setItem("user:challenge_photos", JSON.stringify(updatedPhotos));
            setPhotos(updatedPhotos);

            if (Platform.OS !== "web") {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);
            }
          } catch (error) {
            Alert.alert("Erro", "Não foi possível deletar a foto");
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎯 Desafios</Text>
          <Text style={styles.subtitle}>Ganhe pontos e conquistas</Text>
        </View>

        {/* Botão de Upload */}
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={styles.uploadBtnText}>📸 Enviar Foto</Text>
        </TouchableOpacity>

        {/* Desafios Ativos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Desafios Ativos</Text>
          {CHALLENGES.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <View>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <Text style={styles.challengePoints}>+{challenge.points}pts</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(challenge.progress / challenge.target) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fotos Enviadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📷 Fotos Enviadas ({photos.length})
          </Text>

          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma foto enviada ainda</Text>
              <Text style={styles.emptyStateSubtext}>
                Comece a enviar fotos para ganhar pontos!
              </Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  {Platform.OS !== "web" && photo.uri ? (
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.photoImage}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoPlaceholderText}>{photo.points}</Text>
                    </View>
                  )}

                  <View style={styles.photoInfo}>
                    <Text style={styles.photoCategory}>{photo.points}</Text>
                    <Text style={styles.photoDescription} numberOfLines={2}>
                      {photo.description}
                    </Text>
                    <Text style={styles.photoDate}>{photo.timestamp}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deletePhoto(photo.id)}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Dicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Dicas para Ganhar Pontos</Text>
          <TipCard emoji="📸" title="Qualidade" text="Envie fotos claras e bem iluminadas" />
          <TipCard emoji="📝" title="Descrição" text="Adicione uma descrição detalhada" />
          <TipCard emoji="🎯" title="Consistência" text="Envie fotos regularmente para ganhar mais pontos" />
        </View>
      </ScrollView>

      {/* Modal de Upload */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enviar Foto</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Preview */}
              {selectedPhoto && (
                <View style={styles.previewContainer}>
                  {Platform.OS !== "web" ? (
                    <Image
                      source={{ uri: selectedPhoto }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.previewPlaceholder}>
                      <Text style={styles.previewPlaceholderText}>📸 Foto Selecionada</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Botões de Câmera/Galeria */}
              {!selectedPhoto && (
                <View style={styles.photoSourceButtons}>
                  <TouchableOpacity
                    style={styles.photoSourceBtn}
                    onPress={() => pickImage("camera")}
                  >
                    <Text style={styles.photoSourceBtnText}>📷 Câmera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoSourceBtn}
                    onPress={() => pickImage("gallery")}
                  >
                    <Text style={styles.photoSourceBtnText}>🖼️ Galeria</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Categoria */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Categoria</Text>
                <View style={styles.categoryButtons}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryBtn,
                        selectedCategory === category.id && styles.categoryBtnActive,
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
                          selectedCategory === category.id && styles.categoryBtnTextActive,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Descrição */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
                <View style={styles.descriptionInput}>
                  <Text style={styles.descriptionPlaceholder}>
                    {description || "Descreva sua foto..."}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, !selectedPhoto && styles.modalBtnDisabled]}
                onPress={uploadPhoto}
                disabled={!selectedPhoto || loading}
              >
                <Text style={styles.modalBtnText}>
                  {loading ? "Enviando..." : "Enviar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function TipCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipEmoji}>{emoji}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B8A4C",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  uploadBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  challengeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  challengeDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  challengePoints: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFD700",
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1B8A4C",
  },
  progressText: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#999",
  },
  photosGrid: {
    gap: 12,
  },
  photoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: 150,
  },
  photoPlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  photoInfo: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  photoCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  photoDescription: {
    fontSize: 12,
    color: "#666",
  },
  photoDate: {
    fontSize: 10,
    color: "#999",
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    flexDirection: "row",
    gap: 12,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  tipText: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  modalCloseBtn: {
    fontSize: 24,
    color: "#999",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  previewContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewImage: {
    width: "100%",
    height: 200,
  },
  previewPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
  },
  previewPlaceholderText: {
    fontSize: 24,
    color: "#1B8A4C",
  },
  photoSourceButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  photoSourceBtn: {
    flex: 1,
    backgroundColor: "#E8F5EE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    paddingVertical: 12,
    alignItems: "center",
  },
  photoSourceBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  fieldContainer: {
    marginBottom: 16,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryBtnActive: {
    backgroundColor: "#1B8A4C",
    borderColor: "#1B8A4C",
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  categoryBtnTextActive: {
    color: "#FFFFFF",
  },
  descriptionInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
    justifyContent: "flex-start",
  },
  descriptionPlaceholder: {
    fontSize: 13,
    color: "#999",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#F0F0F0",
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  modalBtnCancelText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 14,
  },
});
