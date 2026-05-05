import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const CUP_SIZE = 350;

export default function SaudeScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState<any>(null);
  const [todayIntake, setTodayIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [intakeHistory, setIntakeHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileStr = await AsyncStorage.getItem("employee:profile");
      const intakeStr = await AsyncStorage.getItem("today:hydration");
      const historyStr = await AsyncStorage.getItem("hydration:history");

      if (profileStr) {
        const prof = JSON.parse(profileStr);
        setProfile(prof);
        calculateDailyGoal(prof);
      }

      if (intakeStr) {
        setTodayIntake(parseInt(intakeStr));
      }

      if (historyStr) {
        setIntakeHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const calculateDailyGoal = (prof: any) => {
    const baseGoal = (prof.peso || 70) * 35;
    const workBonus = prof.tipoTrabalho === "pesado" ? 500 : 0;
    const goal = baseGoal + workBonus;
    setDailyGoal(Math.round(goal));
  };

  const addWater = async () => {
    const newIntake = todayIntake + CUP_SIZE;
    
    try {
      await AsyncStorage.setItem("today:hydration", newIntake.toString());
      
      const newHistory = [
        ...intakeHistory,
        {
          amount: CUP_SIZE,
          time: new Date().toLocaleTimeString("pt-BR"),
          timestamp: new Date().toISOString(),
        },
      ];
      
      await AsyncStorage.setItem("hydration:history", JSON.stringify(newHistory));
      
      setTodayIntake(newIntake);
      setIntakeHistory(newHistory);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (newIntake >= dailyGoal) {
        Alert.alert("🎉 Parabéns!", "Você atingiu sua meta de hidratação do dia!");
      }
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
    }
  };

  const percentage = Math.min((todayIntake / dailyGoal) * 100, 100);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">Hidratação 💧</Text>
            <Text className="text-sm text-muted mt-1">
              Meta diária: {dailyGoal}ml
            </Text>
          </View>

          <View className="items-center gap-4">
            <View className="w-32 h-48 border-4 border-primary rounded-b-3xl rounded-t-lg p-3 bg-blue-50 dark:bg-blue-900/20 relative overflow-hidden">
              <View className="w-12 h-4 bg-primary rounded-b-lg mx-auto mb-2" />
              
              <View
                className="absolute bottom-0 left-0 right-0 bg-blue-400 dark:bg-blue-500 opacity-60 transition-all"
                style={{ height: `${percentage}%` }}
              />
              
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-2xl font-bold text-foreground">
                  {Math.round(percentage)}%
                </Text>
              </View>
            </View>

            <View className="items-center gap-1">
              <Text className="text-lg font-bold text-foreground">
                {todayIntake}ml / {dailyGoal}ml
              </Text>
              <Text className="text-sm text-muted">
                Faltam {Math.max(0, dailyGoal - todayIntake)}ml
              </Text>
            </View>
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="text-sm font-bold text-foreground">💡 Cor da Urina</Text>
            <View className="gap-2">
              <UrineTip color="🟡" text="Amarelo claro = Bem hidratado" />
              <UrineTip color="🟠" text="Amarelo escuro = Beba mais água" />
              <UrineTip color="🔴" text="Marrom = Hidratação crítica" />
            </View>
          </View>

          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Copos (350ml)</Text>
            <View className="flex-row flex-wrap gap-2">
              {[...Array(Math.ceil(dailyGoal / CUP_SIZE))].map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={addWater}
                  className={`flex-1 min-w-[45%] rounded-lg p-3 items-center gap-2 border-2 ${
                    i < todayIntake / CUP_SIZE
                      ? "bg-blue-100 dark:bg-blue-900/40 border-blue-400"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text className="text-2xl">
                    {i < todayIntake / CUP_SIZE ? "💧" : "🥤"}
                  </Text>
                  <Text className="text-xs text-muted">{(i + 1) * CUP_SIZE}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={addWater}
            className="bg-primary rounded-lg py-4 items-center"
          >
            <Text className="text-white font-bold text-lg">+ Adicionar Copo (350ml)</Text>
          </TouchableOpacity>

          {intakeHistory.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-foreground mb-3">Histórico de Hoje</Text>
              <View className="bg-surface rounded-lg p-4 border border-border gap-2">
                {intakeHistory.map((entry, i) => (
                  <View key={i} className="flex-row justify-between items-center py-2 border-b border-border last:border-b-0">
                    <Text className="text-sm text-foreground">💧 {entry.amount}ml</Text>
                    <Text className="text-xs text-muted">{entry.time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function UrineTip({ color, text }: { color: string; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-lg">{color}</Text>
      <Text className="text-sm text-foreground flex-1">{text}</Text>
    </View>
  );
}
