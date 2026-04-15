import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useFirebaseSync } from "@/hooks/use-firebase-sync";

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
      timestamp: new Date().toLocaleString("pt-BR"),
    };

    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);

    // Salvar no AsyncStorage
    try {
      const key = `challenge:${challengeId}:photos`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedPhotos));

      // Sincronizar com Firebase (será feito automaticamente pelo hook)
      // Dados salvos em AsyncStorage serão sincronizados quando houver conexão
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
              <View className="border border-border rounded-lg bg-surface p-3">
                <Text className="text-sm text-muted" numberOfLines={3}>
                  {description || "Ex: Pesagem após treino, Almoço saudável..."}
                </Text>
              </View>
            </View>

            {/* Botões de Foto */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 bg-primary rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold">📷 Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 bg-border rounded-lg py-3 items-center"
              >
                <Text className="text-foreground font-semibold">🖼️ Galeria</Text>
              </TouchableOpacity>
            </View>

            {/* Botão Cancelar */}
            <TouchableOpacity
              onPress={() => {
                setShowForm(false);
                setDescription("");
                setSelectedCategory("atividade");
              }}
              className="bg-error/10 border border-error rounded-lg py-2"
            >
              <Text className="text-error font-semibold text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Galeria de Fotos */}
        {photos.length > 0 && (
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Suas Fotos ({photos.length})</Text>
            <View className="flex-row flex-wrap gap-3">
              {photos.map((photo) => (
                <View key={photo.id} className="relative">
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumbnail}
                  />
                  <View className="absolute top-1 right-1 bg-black/50 rounded-full px-2 py-1">
                    <Text className="text-white text-xs font-semibold">
                      {PHOTO_CATEGORIES.find((c) => c.id === photo.category)?.emoji}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deletePhoto(photo.id)}
                    className="absolute top-1 left-1 bg-error rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-white text-xs font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Detalhes das Fotos */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              {photos.map((photo) => (
                <View key={photo.id} className="pb-3 border-b border-border last:border-b-0">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-semibold text-foreground">
                      {PHOTO_CATEGORIES.find((c) => c.id === photo.category)?.label}
                    </Text>
                    <Text className="text-xs text-muted">{photo.timestamp}</Text>
                  </View>
                  {photo.description && (
                    <Text className="text-sm text-muted">{photo.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Vazio */}
        {photos.length === 0 && !showForm && (
          <View className="bg-surface rounded-2xl p-8 border border-border items-center gap-2">
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
