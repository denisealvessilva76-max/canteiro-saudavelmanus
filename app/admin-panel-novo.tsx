import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface AdminStats {
  totalEmployees: number;
  activeToday: number;
  averageHydration: number;
  totalComplaints: number;
  activeChallenges: number;
}

interface Employee {
  matricula: string;
  name: string;
  turno: string;
  lastCheckIn?: string;
  hydrationToday?: number;
  complaints?: number;
}

const ADMIN_CREDENTIALS = {
  email: "denisealvessilva76@gmail.com",
  password: "POTATO345",
};

export default function AdminPanelNovoScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "funcionarios" | "desafios" | "comunicados">(
    "dashboard"
  );
  const [stats, setStats] = useState<AdminStats>({
    totalEmployees: 0,
    activeToday: 0,
    averageHydration: 0,
    totalComplaints: 0,
    activeChallenges: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedAuth = await AsyncStorage.getItem("admin:authenticated");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
        loadDashboardData();
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    setLoading(true);

    try {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        await AsyncStorage.setItem("admin:authenticated", "true");
        setIsAuthenticated(true);
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        loadDashboardData();
      } else {
        Alert.alert("Erro", "Email ou senha incorretos");
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Carregar dados de empregados
      const allKeys = await AsyncStorage.getAllKeys();
      const employeeKeys = allKeys.filter((key) => key.includes("employee:profile"));

      const employeeProfiles: Employee[] = [];
      for (const key of employeeKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const profile = JSON.parse(data);
          employeeProfiles.push({
            matricula: profile.matricula || "N/A",
            name: profile.name || "Desconhecido",
            turno: profile.turno || "Diurno",
            lastCheckIn: profile.lastCheckIn,
            hydrationToday: profile.hydrationToday || 0,
            complaints: profile.complaints || 0,
          });
        }
      }

      setEmployees(employeeProfiles);

      // Calcular estatísticas
      const activeToday = employeeProfiles.filter((e) => e.lastCheckIn).length;
      const avgHydration =
        employeeProfiles.length > 0
          ? Math.round(
              employeeProfiles.reduce((sum, e) => sum + (e.hydrationToday || 0), 0) /
                employeeProfiles.length
            )
          : 0;
      const totalComplaints = employeeProfiles.reduce((sum, e) => sum + (e.complaints || 0), 0);

      setStats({
        totalEmployees: employeeProfiles.length,
        activeToday,
        averageHydration: avgHydration,
        totalComplaints,
        activeChallenges: 5, // Exemplo
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("admin:authenticated");
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center gap-6">
            {/* Logo/Título */}
            <View className="items-center gap-2 mb-8">
              <Text className="text-4xl">🔐</Text>
              <Text className="text-3xl font-bold text-primary text-center">Painel Admin</Text>
              <Text className="text-base text-muted text-center">
                Canteiro Saudável - Monitoramento de Saúde
              </Text>
            </View>

            {/* Formulário */}
            <View className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="seu@email.com"
                  placeholderTextColor="#9BA1A6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Senha</Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="••••••••"
                  placeholderTextColor="#9BA1A6"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-primary rounded-xl py-4 items-center mt-4"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Entrar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Rodapé */}
            <View className="items-center mt-8">
              <Text className="text-xs text-muted">
                Acesso restrito a administradores autorizados
              </Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header Verde */}
        <View className="bg-primary p-6 gap-2">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-2xl font-bold">Painel Admin</Text>
              <Text className="text-white/80 text-sm">Monitoramento em Tempo Real</Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-white/20 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-semibold text-sm">Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Abas */}
        <View className="flex-row bg-surface border-b border-border">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "funcionarios", label: "👥 Funcionários" },
            { id: "desafios", label: "🏆 Desafios" },
            { id: "comunicados", label: "📢 Comunicados" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === tab.id ? "border-primary" : "border-transparent"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  activeTab === tab.id ? "text-primary" : "text-muted"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo */}
        <View className="p-4 gap-4">
          {activeTab === "dashboard" && (
            <>
              {/* Cards de Estatísticas */}
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
                    <Text className="text-2xl mb-1">👥</Text>
                    <Text className="text-2xl font-bold text-primary">{stats.totalEmployees}</Text>
                    <Text className="text-xs text-muted">Total de Funcionários</Text>
                  </View>
                  <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
                    <Text className="text-2xl mb-1">✅</Text>
                    <Text className="text-2xl font-bold text-success">{stats.activeToday}</Text>
                    <Text className="text-xs text-muted">Ativos Hoje</Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
                    <Text className="text-2xl mb-1">💧</Text>
                    <Text className="text-2xl font-bold text-primary">{stats.averageHydration}</Text>
                    <Text className="text-xs text-muted">ml Médio</Text>
                  </View>
                  <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
                    <Text className="text-2xl mb-1">⚠️</Text>
                    <Text className="text-2xl font-bold text-warning">{stats.totalComplaints}</Text>
                    <Text className="text-xs text-muted">Queixas</Text>
                  </View>
                </View>
              </View>

              {/* Gráfico Placeholder */}
              <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                <Text className="font-semibold text-foreground">Evolução Mensal</Text>
                <View className="h-40 bg-primary/10 rounded-lg items-center justify-center">
                  <Text className="text-muted">📊 Gráfico em desenvolvimento</Text>
                </View>
              </View>
            </>
          )}

          {activeTab === "funcionarios" && (
            <>
              <Text className="font-semibold text-foreground mb-2">
                Funcionários ({employees.length})
              </Text>
              <View className="gap-2">
                {employees.map((emp) => (
                  <View
                    key={emp.matricula}
                    className="bg-surface rounded-xl p-3 border border-border gap-2"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{emp.name}</Text>
                        <Text className="text-xs text-muted">Matrícula: {emp.matricula}</Text>
                      </View>
                      <View className="bg-primary/10 rounded-lg px-2 py-1">
                        <Text className="text-xs font-semibold text-primary">{emp.turno}</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-4 text-xs text-muted">
                      <Text>💧 {emp.hydrationToday || 0}ml</Text>
                      <Text>⚠️ {emp.complaints || 0} queixas</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {activeTab === "desafios" && (
            <View className="bg-surface rounded-2xl p-4 border border-border items-center gap-2">
              <Text className="text-3xl">🏆</Text>
              <Text className="font-semibold text-foreground">Desafios Ativos</Text>
              <Text className="text-sm text-muted text-center">
                Acompanhe os desafios em andamento e o progresso de cada funcionário
              </Text>
            </View>
          )}

          {activeTab === "comunicados" && (
            <View className="bg-surface rounded-2xl p-4 border border-border items-center gap-2">
              <Text className="text-3xl">📢</Text>
              <Text className="font-semibold text-foreground">Criar Comunicado</Text>
              <Text className="text-sm text-muted text-center">
                Envie avisos e informações para todos os funcionários
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
