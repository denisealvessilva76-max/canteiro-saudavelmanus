import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useFirebaseSync } from "@/hooks/use-firebase-sync";

interface Cup {
  id: number;
  ml: number;
  label: string;
}

const CUPS: Cup[] = [
  { id: 1, ml: 100, label: "100ml" },
  { id: 2, ml: 150, label: "150ml" },
  { id: 3, ml: 200, label: "200ml" },
  { id: 4, ml: 250, label: "250ml" },
];

interface HydrationCupsProps {
  onUpdate?: (totalMl: number) => void;
}

export function HydrationCups({ onUpdate }: HydrationCupsProps) {
  const colors = useColors();
  const [totalMl, setTotalMl] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [history, setHistory] = useState<Array<{ ml: number; time: string }>>([]);
  const [matricula, setMatricula] = useState<string | null>(null);

  const { syncWaterIntake } = useFirebaseSync({ matricula: matricula || "" });

  useEffect(() => {
    loadHydrationData();
    calculateDailyGoal();
    loadMatricula();
  }, []);

  const loadMatricula = async () => {
    const m = await AsyncStorage.getItem("employee:matricula");
    setMatricula(m);
  };

  const loadHydrationData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const key = `hydration:${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        setTotalMl(parsed.total || 0);
        setHistory(parsed.history || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de hidratação:", error);
    }
  };

  const calculateDailyGoal = async () => {
    try {
      const profileRaw = await AsyncStorage.getItem("employee:profile");
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        const weight = parseFloat(profile.weight) || 70;
        const workType = profile.workType || "moderado";

        let baseGoal = weight * 35; // 35ml por kg
        if (workType === "pesado") baseGoal *= 1.3;
        else if (workType === "leve") baseGoal *= 0.9;

        setDailyGoal(Math.round(baseGoal));
      }
    } catch (error) {
      console.error("Erro ao calcular meta de hidratação:", error);
    }
  };

  const addWater = async (ml: number) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newTotal = totalMl + ml;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const newHistory = [...history, { ml, time: timeStr }];
    setTotalMl(newTotal);
    setHistory(newHistory);

    // Salvar no AsyncStorage
    try {
      const today = new Date().toISOString().split("T")[0];
      const key = `hydration:${today}`;
      await AsyncStorage.setItem(
        key,
        JSON.stringify({ total: newTotal, history: newHistory, date: today })
      );

      // Sincronizar com Firebase via fila offline
      if (matricula) {
        await syncWaterIntake({
          waterIntake: newTotal,
          glassesConsumed: newHistory.length,
          goal: dailyGoal,
          date: today
        });
      }
    } catch (error) {
      console.error("Erro ao salvar hidratação:", error);
    }

    onUpdate?.(newTotal);
  };

  const resetDaily = async () => {
    setTotalMl(0);
    setHistory([]);
    try {
      const today = new Date().toISOString().split("T")[0];
      await AsyncStorage.removeItem(`hydration:${today}`);
    } catch (error) {
      console.error("Erro ao resetar hidratação:", error);
    }
  };

  const percentage = Math.min((totalMl / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - totalMl, 0);

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="gap-6 p-4">
        {/* Meta de Hidratação */}
        <View className="bg-surface rounded-2xl p-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-2">Meta Diária</Text>
          <Text className="text-3xl font-bold text-primary mb-1">{dailyGoal}ml</Text>
          <Text className="text-sm text-muted">
            Baseado em seu peso, altura e tipo de trabalho
          </Text>
        </View>

        {/* Progresso Visual - Garrafa */}
        <View className="bg-surface rounded-2xl p-6 border border-border items-center">
          <Text className="text-base font-semibold text-foreground mb-4">Progresso do Dia</Text>

          {/* Garrafa Visual */}
          <View
            style={[
              styles.bottle,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Água dentro da garrafa */}
            <View
              style={[
                styles.waterFill,
                {
                  height: `${percentage}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          {/* Informações */}
          <View className="mt-4 items-center">
            <Text className="text-2xl font-bold text-primary">{totalMl}ml</Text>
            <Text className="text-sm text-muted">
              {remaining > 0 ? `Faltam ${remaining}ml` : "Meta atingida! 🎉"}
            </Text>
            <Text className="text-xs text-muted mt-1">{Math.round(percentage)}%</Text>
          </View>
        </View>

        {/* Barra de Progresso */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Copos */}
        <View className="gap-3">
          <Text className="text-base font-semibold text-foreground px-2">
            Adicionar Água
          </Text>
          <View className="flex-row flex-wrap gap-3 justify-center">
            {CUPS.map((cup) => (
              <TouchableOpacity
                key={cup.id}
                onPress={() => addWater(cup.ml)}
                style={[
                  styles.cup,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🥤</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {cup.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Histórico */}
        {history.length > 0 && (
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-base font-semibold text-foreground mb-3">
              Histórico de Hoje
            </Text>
            <View className="gap-2">
              {history.map((entry, idx) => (
                <View key={idx} className="flex-row justify-between items-center py-2 border-b border-border">
                  <Text className="text-sm text-foreground">{entry.ml}ml</Text>
                  <Text className="text-xs text-muted">{entry.time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Botão Reset */}
        {totalMl > 0 && (
          <TouchableOpacity
            onPress={resetDaily}
            className="bg-error/10 border border-error rounded-xl py-3 items-center"
          >
            <Text className="text-error font-semibold">Resetar Dia</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bottle: {
    width: 80,
    height: 180,
    borderWidth: 3,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  waterFill: {
    width: "100%",
    borderRadius: 15,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  cup: {
    width: "23%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
