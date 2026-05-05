import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function PerfilScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileStr = await AsyncStorage.getItem("employee:profile");
      const pointsStr = await AsyncStorage.getItem("employee:points");
      const streakStr = await AsyncStorage.getItem("employee:streak");

      if (profileStr) setProfile(JSON.parse(profileStr));
      if (pointsStr) setPoints(parseInt(pointsStr));
      if (streakStr) setStreak(parseInt(streakStr));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Sair",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("isLoggedIn");
            await AsyncStorage.removeItem("today:checkin");
            router.replace("/");
          } catch (error) {
            console.error("Erro ao sair:", error);
          }
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <Text className="text-5xl">👤</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">
                {profile.nome}
              </Text>
              <Text className="text-sm text-muted">
                Matrícula: {profile.matricula}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <StatCard icon="⭐" label="Pontos" value={points.toString()} />
            <StatCard icon="🔥" label="Sequência" value={streak.toString()} />
            <StatCard icon="🏆" label="Nível" value="1" />
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="text-lg font-bold text-foreground">Informações Pessoais</Text>
            <InfoRow label="Cargo" value={profile.cargo || "N/A"} />
            <InfoRow label="Peso" value={`${profile.peso || 0} kg`} />
            <InfoRow label="Altura" value={`${profile.altura || 0} cm`} />
            <InfoRow label="Turno" value={profile.turno || "N/A"} />
            <InfoRow label="Tipo de Trabalho" value={profile.tipoTrabalho || "N/A"} />
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="text-lg font-bold text-foreground">Conquistas</Text>
            <View className="flex-row gap-2 flex-wrap">
              <Badge icon="🌟" label="Iniciante" />
              <Badge icon="💧" label="Hidratado" />
              <Badge icon="🧘" label="Alongado" />
              <Badge icon="🎯" label="Focado" />
            </View>
          </View>

          <View className="gap-2">
            <SettingButton icon="🔔" label="Notificações" />
            <SettingButton icon="⚙️" label="Preferências" />
            <SettingButton icon="❓" label="Ajuda" />
            <SettingButton icon="📋" label="Sobre" />
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg py-4 items-center"
          >
            <Text className="text-white font-bold text-lg">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center gap-2">
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-border last:border-b-0">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="bg-primary/10 rounded-full px-3 py-2 flex-row items-center gap-1">
      <Text className="text-sm">{icon}</Text>
      <Text className="text-xs font-semibold text-primary">{label}</Text>
    </View>
  );
}

function SettingButton({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between border border-border">
      <View className="flex-row items-center gap-3">
        <Text className="text-xl">{icon}</Text>
        <Text className="text-base font-semibold text-foreground">{label}</Text>
      </View>
      <Text className="text-lg">→</Text>
    </TouchableOpacity>
  );
}
