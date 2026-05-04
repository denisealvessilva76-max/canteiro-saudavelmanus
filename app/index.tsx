import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Verificar se usuário já fez cadastro
      const hasProfile = await AsyncStorage.getItem("employee:profile");
      const hasMatricula = await AsyncStorage.getItem("employee:matricula");

      if (hasProfile && hasMatricula) {
        // Usuário já fez cadastro, ir para login
        router.replace("/login");
      } else {
        // Novo usuário, ir para cadastro
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-2xl font-bold text-foreground">Carregando...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-primary/10 to-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="items-center justify-center gap-8 px-6 py-12">
          {/* Logo/Ícone */}
          <View className="items-center gap-4">
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
              <Text className="text-5xl">🌿</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">Canteiro Saudável</Text>
            <Text className="text-base text-muted text-center">
              Seu bem-estar é nossa prioridade
            </Text>
          </View>

          {/* Benefícios */}
          <View className="gap-4 w-full">
            <BenefitCard icon="💧" title="Hidratação" description="Acompanhe seu consumo de água diário" />
            <BenefitCard icon="🧘" title="Ergonomia" description="Alongamentos e exercícios guiados" />
            <BenefitCard icon="🧠" title="Saúde Mental" description="Suporte e técnicas de respiração" />
            <BenefitCard icon="🎯" title="Desafios" description="Gamificação e recompensas" />
          </View>

          {/* Botões */}
          <View className="gap-3 w-full mt-8">
            <TouchableOpacity
              onPress={() => router.push("/cadastro")}
              className="bg-primary rounded-xl py-4 items-center"
            >
              <Text className="text-white font-bold text-lg">Começar Agora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="border-2 border-primary rounded-xl py-4 items-center"
            >
              <Text className="text-primary font-bold text-lg">Já tenho cadastro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const colors = useColors();
  return (
    <View className="flex-row items-center gap-4 bg-surface rounded-xl p-4 border border-border">
      <Text className="text-4xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted">{description}</Text>
      </View>
    </View>
  );
}
