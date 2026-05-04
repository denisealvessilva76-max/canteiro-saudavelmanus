import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useFirebaseSync } from "@/hooks/use-firebase-sync";
import { saveToFirebase } from "@/lib/firebase";
import { useState, useEffect } from "react";

interface ChallengePhoto {
  id: string;
  uri: string;
  category: "pesagem" | "refeicao" | "atividade" | "outro";
  description: string;
  timestamp: string;
}

interface ChallengePhotosProps {
  challengeId: string;
  challengeName: string;
  onPhotoAdded?: (photo: ChallengePhoto) => void;
}

const PHOTO_CATEGORIES = [
  { id: "pesagem", label: "⚖️ Pesagem", emoji: "⚖️" },
  { id: "refeicao", label: "🍽️ Refeição", emoji: "🍽️" },
  { id: "atividade", label: "🏃 Atividade", emoji: "🏃" },
  { id: "outro", label: "📝 Outro", emoji: "📝" },
];

export function ChallengePhotos({ challengeId, challengeName, onPhotoAdded }: ChallengePhotosProps) {
  const colors = useColors();
  const [photos, setPhotos] = useState<ChallengePhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"pesagem" | "refeicao" | "atividade" | "outro">("atividade");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [matricula, setMatricula] = useState("");
  const { syncProfile } = useFirebaseSync({ matricula, enabled: !!matricula });

  useEffect(() => {
    loadPhotos();
    loadMatricula();
  }, []);

  const loadMatricula = async () => {
    const mat = await AsyncStorage.getItem("employee:matricula");
    if (mat) setMatricula(mat);
  };

  const loadPhotos = async () => {
    try {
      const key = `challenge:${challengeId}:photos`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        setPhotos(JSON.parse(data));
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permissão", "Permissão de câmera é necessária");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto");
    }
  };

  const addPhoto = async (uri: string) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newPhoto: ChallengePhoto = {
      id: Date.now().toString(),
      uri,
      category: selectedCategory,
      description,
      timestamp: new Date().toISOString(),
    };

    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);

    // Salvar no AsyncStorage
    try {
      const key = `challenge:${challengeId}:photos`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedPhotos));

      // Sincronizar com Firebase
      if (matricula) {
        const date = new Date().toISOString().split("T")[0];
        await saveToFirebase(matricula, `challenge_photos/${challengeId}/${newPhoto.id}`, {
          id: newPhoto.id,
          challengeId,
          category: selectedCategory,
          description,
          timestamp: newPhoto.timestamp,
          updatedAt: Date.now(),
        }).catch(() => {});

        // Sincronizar com PostgreSQL
        try {
          const apiUrl = typeof window !== "undefined" && window.location?.hostname
            ? `${window.location.protocol}//${window.location.hostname.replace(/^\d{4}-/, "3000-")}/api/painel/challenge-photo`
            : "/api/painel/challenge-photo";
          await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matricula,
              challengeId,
              photoId: newPhoto.id,
              category: selectedCategory,
              description,
              date,
            }),
          }).catch(() => {});
        } catch (e) {
          console.warn("[ChallengePhotos] PostgreSQL sync failed (offline?):", e);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
    }

    // Reset form
    setDescription("");
    setSelectedCategory("atividade");
    setShowForm(false);
    onPhotoAdded?.(newPhoto);

    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const deletePhoto = async (photoId: string) => {
    const updatedPhotos = photos.filter((p) => p.id !== photoId);
    setPhotos(updatedPhotos);

    try {
      const key = `challenge:${challengeId}:photos`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="gap-4 p-4">
        {/* Cabeçalho */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-1">{challengeName}</Text>
          <Text className="text-sm text-muted">
            {photos.length} foto{photos.length !== 1 ? "s" : ""} adicionada{photos.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Botão Adicionar Foto */}
        {!showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="bg-primary rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">📸 Adicionar Foto</Text>
          </TouchableOpacity>
        )}

        {/* Formulário */}
        {showForm && (
          <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
            {/* Categoria */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Categoria da Foto</Text>
              <View className="flex-row flex-wrap gap-2">
                {PHOTO_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id as any)}
                    className={`flex-1 min-w-[45%] py-2 px-3 rounded-lg items-center border-2 ${
                      selectedCategory === cat.id
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedCategory === cat.id ? "text-white" : "text-foreground"
                      }`}
                    >
                      {cat.emoji} {cat.label.split(" ")[1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descrição */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Descrição (opcional)</Text>
              <View
                className="border border-border rounded-lg px-3 py-2"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="text-sm text-foreground"
                  onPress={() => {}}
                  placeholder="Descreva a foto..."
                  placeholderTextColor={colors.muted}
                >
                  {description || "Descreva a foto..."}
                </Text>
              </View>
            </View>

            {/* Botões de Ação */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold">📷 Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 bg-green-500 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold">📸 Câmera</Text>
              </TouchableOpacity>
            </View>

            {/* Cancelar */}
            <TouchableOpacity
              onPress={() => {
                setShowForm(false);
                setDescription("");
              }}
              className="bg-gray-300 rounded-lg py-2 items-center"
            >
              <Text className="text-gray-700 font-semibold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Galeria de Fotos */}
        {photos.length > 0 && (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Fotos Adicionadas</Text>
            <View className="flex-row flex-wrap gap-2">
              {photos.map((photo) => (
                <View key={photo.id} className="relative">
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumbnail}
                  />
                  <TouchableOpacity
                    onPress={() => deletePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-white text-xs font-bold">✕</Text>
                  </TouchableOpacity>
                  <View className="absolute bottom-1 left-1 bg-black/70 rounded px-2 py-1">
                    <Text className="text-white text-xs">{photo.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Estado Vazio */}
        {photos.length === 0 && !showForm && (
          <View className="items-center justify-center py-8 gap-2">
            <Text className="text-3xl">📸</Text>
            <Text className="text-base font-semibold text-foreground">Nenhuma foto ainda</Text>
            <Text className="text-sm text-muted text-center">
              Adicione fotos para documentar seu progresso no desafio
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
});
