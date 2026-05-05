import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [profile, setProfile] = useState<any>(null);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
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
      const todayCheckinStr = await AsyncStorage.getItem("today:checkin");

      if (profileStr) setProfile(JSON.parse(profileStr));
      if (pointsStr) setPoints(parseInt(pointsStr));
      if (streakStr) setStreak(parseInt(streakStr));
      if (todayCheckinStr) setTodayCheckin(JSON.parse(todayCheckinStr));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleCheckin = async () => {
    try {
      const checkinData = {
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("pt-BR"),
        wellbeing: "good",
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem("today:checkin", JSON.stringify(checkinData));
      
      const newStreak = streak + 1;
      const newPoints = points + 10;
      
      await AsyncStorage.setItem("employee:streak", newStreak.toString());
      await AsyncStorage.setItem("employee:points", newPoints.toString());

      setTodayCheckin(checkinData);
      setStreak(newStreak);
      setPoints(newPoints);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso!", "Check-in realizado! +10 pontos");
    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
      Alert.alert("Erro", "Não foi possível fazer check-in");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Olá, {profile?.nome?.split(" ")[0]}! 👋
            </Text>
            <Text className="text-sm text-muted mt-1">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <StatCard icon="🔥" label="Sequência" value={streak.toString()} />
            <StatCard icon="⭐" label="Pontos" value={points.toString()} />
            <StatCard icon="🏆" label="Nível" value="1" />
          </View>

          {!todayCheckin ? (
            <View className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 gap-4">
              <View>
                <Text className="text-white text-lg font-bold">Como você está hoje?</Text>
                <Text className="text-white/80 text-sm mt-1">
                  Faça seu check-in diário e ganhe pontos
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCheckin}
                className="bg-white rounded-lg py-3 items-center"
              >
                <Text className="text-primary font-bold">Fazer Check-in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">✅</Text>
                <View>
                  <Text className="text-green-900 dark:text-green-100 font-bold">
                    Check-in realizado!
                  </Text>
                  <Text className="text-green-800 dark:text-green-200 text-sm">
                    {todayCheckin.time}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Ações Rápidas</Text>
            <View className="gap-3">
              <QuickActionButton icon="💧" label="Hidratação" onPress={() => router.push('/(tabs)/saude')} />
              <QuickActionButton icon="🧘" label="Alongamento" onPress={() => router.push('/(tabs)/ergonomia')} />
              <QuickActionButton icon="🧠" label="Respiração" onPress={() => router.push('/(tabs)/comunicados')} />
              <QuickActionButton icon="🎯" label="Desafios" onPress={() => router.push('/(tabs)/perfil')} />
            </View>
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-bold text-foreground mb-2">💡 Dica do Dia</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Beba um copo de água a cada hora para manter-se hidratado e melhorar sua concentração.
            </Text>
          </View>
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

function QuickActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center gap-3 p-4 rounded-lg border-2 border-border bg-surface active:opacity-70">
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-sm font-semibold text-foreground flex-1">{label}</Text>
      <Text className="text-lg">→</Text>
    </TouchableOpacity>
  );
}
