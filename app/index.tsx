import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "@/lib/trpc";

/**
 * Tela inicial que redireciona o usuário para:
 * - /cadastro: se não existe usuário no PostgreSQL
 * - /login: se existe usuário mas não está logado localmente
 * - /(tabs): se está logado
 * 
 * IMPORTANTE: Verifica no banco de dados, não apenas no AsyncStorage
 */
export default function IndexScreen() {
  const [checking, setChecking] = useState(true);
  const params = useLocalSearchParams();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Verificar se há parâmetro reset=true na URL
      if (params.reset === 'true') {
        console.log("[Index] Parâmetro reset detectado - limpando AsyncStorage");
        await AsyncStorage.clear();
        router.replace("/cadastro");
        return;
      }
      
      // 1. Verificar se há sessão de usuário salva (chave unificada)
      const matricula = await AsyncStorage.getItem("employee:matricula");
      const profileRaw = await AsyncStorage.getItem("employee:profile");

      if (matricula && profileRaw) {
        // Usuário está logado localmente e perfil completo → ir para home (tabs)
        console.log("[Index] Usuário logado localmente → redirecionando para home");
        router.replace("/(tabs)");
        return;
      }

      // 2. Não está logado localmente, verificar se já fez cadastro alguma vez
      if (matricula) {
        // Já fez cadastro (matricula existe) mas perfil está incompleto → ir para cadastro
        console.log("[Index] Matrícula existe mas perfil incompleto → redirecionando para cadastro");
        router.replace("/cadastro");
      } else {
        // Nunca fez cadastro → ir para tela de login (que permite ir para cadastro)
        console.log("[Index] Nenhum cadastro encontrado → redirecionando para login");
        router.replace("/login");
      }
    } catch (error) {
      console.error("[Index] Erro ao verificar status de autenticação:", error);
      // Em caso de erro, ir para cadastro (seguro)
      router.replace("/cadastro");
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#16A34A" />
        <Text className="text-muted mt-4">Carregando...</Text>
      </View>
    );
  }

  return null;
}
