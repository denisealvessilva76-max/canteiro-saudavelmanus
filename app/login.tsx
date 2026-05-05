import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!matricula || !nome) {
      Alert.alert("Erro", "Preencha matrícula e nome");
      return;
    }

    setIsLoading(true);
    try {
      const profileStr = await AsyncStorage.getItem("employee:profile");
      const savedMatricula = await AsyncStorage.getItem("employee:matricula");

      if (!profileStr || !savedMatricula) {
        Alert.alert("Erro", "Cadastro não encontrado. Faça o cadastro primeiro.");
        setIsLoading(false);
        return;
      }

      const profile = JSON.parse(profileStr);

      if (profile.matricula !== matricula || profile.nome.toLowerCase() !== nome.toLowerCase()) {
        Alert.alert("Erro", "Matrícula ou nome incorretos");
        setIsLoading(false);
        return;
      }

      // Usar useAuth para fazer login corretamente - salva em localStorage/SecureStore
      await authLogin(matricula, nome);
      
      // Aguardar um pouco para o estado ser atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await AsyncStorage.setItem("lastLogin", new Date().toISOString());
      await AsyncStorage.setItem("isLoggedIn", "true");

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const hasSeenTutorial = await AsyncStorage.getItem("hasSeenTutorial");
      if (!hasSeenTutorial) {
        router.replace("/tutorial");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro", "Não foi possível fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-primary/10 to-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="gap-8 px-6 py-12">
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <Text className="text-4xl">🌿</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">Bem-vindo!</Text>
            <Text className="text-base text-muted text-center">
              Entre com sua matrícula e nome para acessar
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Matrícula</Text>
              <TextInput
                placeholder="Ex: 12345"
                value={matricula}
                onChangeText={setMatricula}
                editable={!isLoading}
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Nome</Text>
              <TextInput
                placeholder="Seu nome completo"
                value={nome}
                onChangeText={setNome}
                editable={!isLoading}
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`rounded-lg py-4 items-center ${
                isLoading ? "bg-primary/50" : "bg-primary"
              }`}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isLoading}
              className="border-2 border-primary rounded-lg py-4 items-center"
            >
              <Text className="text-primary font-bold">Voltar</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center gap-2">
            <Text className="text-sm text-muted">Não tem cadastro?</Text>
            <TouchableOpacity onPress={() => router.replace("/cadastro")}>
              <Text className="text-primary font-semibold">Faça seu cadastro aqui</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
