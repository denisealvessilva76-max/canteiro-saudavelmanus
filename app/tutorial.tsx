import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const tutorials = [
  {
    icon: "💧",
    title: "Hidratação",
    description: "Acompanhe seu consumo de água diário com copos interativos. O app calcula sua meta baseado em peso, altura e tipo de trabalho.",
  },
  {
    icon: "🧘",
    title: "Ergonomia",
    description: "Acesse alongamentos e exercícios guiados com imagens e narração. Perfeito para pausas durante o trabalho.",
  },
  {
    icon: "🧠",
    title: "Saúde Mental",
    description: "Técnicas de respiração guiada, mapa mental de bem-estar e contatos de apoio sempre à mão.",
  },
  {
    icon: "📢",
    title: "Avisos",
    description: "Receba notícias e comunicados importantes da empresa filtrados por categoria.",
  },
  {
    icon: "🎯",
    title: "Desafios",
    description: "Participe de desafios, envie fotos de progresso e ganhe pontos para resgatar prêmios.",
  },
  {
    icon: "👤",
    title: "Perfil",
    description: "Gerencie seus dados pessoais, veja seu histórico de progresso e estatísticas de saúde.",
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < tutorials.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await finishTutorial();
    }
  };

  const handleSkip = async () => {
    await finishTutorial();
  };

  const finishTutorial = async () => {
    try {
      await AsyncStorage.setItem("hasSeenTutorial", "true");
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Erro ao finalizar tutorial:", error);
    }
  };

  const tutorial = tutorials[currentStep];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}>
        <View className="gap-6 px-6 py-8">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-foreground">Tutorial</Text>
            <Text className="text-sm text-muted">
              {currentStep + 1} de {tutorials.length}
            </Text>
          </View>

          <View className="flex-row gap-1">
            {tutorials.map((_, i) => (
              <View
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </View>

          <View className="gap-6 py-8">
            <View className="items-center">
              <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Text className="text-6xl">{tutorial.icon}</Text>
              </View>
              <Text className="text-3xl font-bold text-foreground text-center">
                {tutorial.title}
              </Text>
            </View>

            <View className="bg-surface rounded-lg p-6 border border-border">
              <Text className="text-base text-foreground leading-relaxed">
                {tutorial.description}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-3 px-6 pb-8">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-primary rounded-lg py-4 items-center"
          >
            <Text className="text-white font-bold text-lg">
              {currentStep === tutorials.length - 1 ? "Começar" : "Próximo"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            className="border-2 border-primary rounded-lg py-4 items-center"
          >
            <Text className="text-primary font-bold">Pular Tutorial</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
