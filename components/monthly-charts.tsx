import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DailyData {
  date: string;
  hydration?: number;
  systolic?: number;
  diastolic?: number;
  points?: number;
}

interface MonthlyChartsProps {
  month?: number;
  year?: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 32;
const BAR_WIDTH = CHART_WIDTH / 30; // ~30 dias

export function MonthlyCharts({ month, year }: MonthlyChartsProps) {
  const colors = useColors();
  const [hydrationData, setHydrationData] = useState<DailyData[]>([]);
  const [pressureData, setPressureData] = useState<DailyData[]>([]);
  const [pointsData, setPointsData] = useState<DailyData[]>([]);
  const [stats, setStats] = useState({
    avgHydration: 0,
    avgSystolic: 0,
    avgDiastolic: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    loadMonthlyData();
  }, [month, year]);

  const loadMonthlyData = async () => {
    try {
      const now = new Date();
      const currentMonth = month || now.getMonth();
      const currentYear = year || now.getFullYear();

      const allKeys = await AsyncStorage.getAllKeys();
      const hydrationKeys = allKeys.filter((key) => key.startsWith("hydration:"));
      const pressureKeys = allKeys.filter((key) => key.startsWith("pressure:"));
      const pointsKeys = allKeys.filter((key) => key.startsWith("points:"));

      // Carregar dados de hidratação
      const hydration: DailyData[] = [];
      for (const key of hydrationKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const date = new Date(parsed.date);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            hydration.push({
              date: parsed.date,
              hydration: parsed.total || 0,
            });
          }
        }
      }

      // Carregar dados de pressão
      const pressure: DailyData[] = [];
      for (const key of pressureKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const date = new Date(parsed.date);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            pressure.push({
              date: parsed.date,
              hydration: 0,
              systolic: parsed.systolic || 0,
              diastolic: parsed.diastolic || 0,
            });
          }
        }
      }

      // Carregar dados de pontos
      const points: DailyData[] = [];
      for (const key of pointsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const date = new Date(parsed.date);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            points.push({
              date: parsed.date,
              hydration: 0,
              points: parsed.points || 0,
            });
          }
        }
      }

      setHydrationData(hydration);
      setPressureData(pressure);
      setPointsData(points);

      // Calcular médias
      const avgHydration = hydration.length > 0 
        ? Math.round(hydration.reduce((sum, d) => sum + (d.hydration || 0), 0) / hydration.length)
        : 0;
      const avgSystolic = pressure.length > 0
        ? Math.round(pressure.reduce((sum, d) => sum + (d.systolic || 0), 0) / pressure.length)
        : 0;
      const avgDiastolic = pressure.length > 0
        ? Math.round(pressure.reduce((sum, d) => sum + (d.diastolic || 0), 0) / pressure.length)
        : 0;
      const totalPoints = points.reduce((sum, d) => sum + (d.points || 0), 0);

      setStats({
        avgHydration,
        avgSystolic,
        avgDiastolic,
        totalPoints,
      });
    } catch (error) {
      console.error("Erro ao carregar dados mensais:", error);
    }
  };

  const getMonthName = (m: number) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    return months[m];
  };

  const renderHydrationChart = () => {
    if (hydrationData.length === 0) {
      return (
        <View className="items-center py-8">
          <Text className="text-muted">Sem dados de hidratação este mês</Text>
        </View>
      );
    }

    const maxHydration = Math.max(...hydrationData.map((d) => d.hydration || 0), 2000);

    return (
      <View className="gap-3">
        <View className="flex-row justify-between items-end h-40 gap-1 bg-primary/5 rounded-lg p-3">
          {hydrationData.map((data, idx) => {
            const height = ((data.hydration || 0) / maxHydration) * 120;
            return (
              <View
                key={idx}
                className="flex-1 bg-primary rounded-t-lg"
                style={{ height: Math.max(height, 4) }}
              />
            );
          })}
        </View>
        <View className="flex-row justify-between text-xs text-muted">
          <Text className="text-xs text-muted">Dia 1</Text>
          <Text className="text-xs text-muted">Dia {hydrationData.length}</Text>
        </View>
      </View>
    );
  };

  const renderPressureChart = () => {
    if (pressureData.length === 0) {
      return (
        <View className="items-center py-8">
          <Text className="text-muted">Sem dados de pressão este mês</Text>
        </View>
      );
    }

    return (
      <View className="gap-3">
        <View className="flex-row justify-between items-end h-40 gap-1 bg-warning/5 rounded-lg p-3">
          {pressureData.map((data, idx) => {
            const systolicHeight = ((data.systolic || 0) / 200) * 120;
            return (
              <View key={idx} className="flex-1 gap-0.5">
                <View
                  className="bg-warning rounded-t-lg w-full"
                  style={{ height: Math.max(systolicHeight, 4) }}
                />
              </View>
            );
          })}
        </View>
        <View className="flex-row justify-between text-xs text-muted">
          <Text className="text-xs text-muted">Sistólica</Text>
          <Text className="text-xs text-muted">{stats.avgSystolic} mmHg (média)</Text>
        </View>
      </View>
    );
  };

  const renderPointsChart = () => {
    if (pointsData.length === 0) {
      return (
        <View className="items-center py-8">
          <Text className="text-muted">Sem dados de pontos este mês</Text>
        </View>
      );
    }

    const maxPoints = Math.max(...pointsData.map((d) => d.points || 0), 100);

    return (
      <View className="gap-3">
        <View className="flex-row justify-between items-end h-40 gap-1 bg-success/5 rounded-lg p-3">
          {pointsData.map((data, idx) => {
            const height = ((data.points || 0) / maxPoints) * 120;
            return (
              <View
                key={idx}
                className="flex-1 bg-success rounded-t-lg"
                style={{ height: Math.max(height, 4) }}
              />
            );
          })}
        </View>
        <View className="flex-row justify-between text-xs text-muted">
          <Text className="text-xs text-muted">Dia 1</Text>
          <Text className="text-xs text-muted">Total: {stats.totalPoints} pontos</Text>
        </View>
      </View>
    );
  };

  const currentMonth = month || new Date().getMonth();
  const currentYear = year || new Date().getFullYear();

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="gap-6 p-4">
        {/* Cabeçalho */}
        <View className="gap-1">
          <Text className="text-2xl font-bold text-foreground">
            {getMonthName(currentMonth)} {currentYear}
          </Text>
          <Text className="text-sm text-muted">Evolução mensal de saúde</Text>
        </View>

        {/* Gráfico de Hidratação */}
        <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-foreground">💧 Hidratação</Text>
              <Text className="text-2xl font-bold text-primary mt-1">{stats.avgHydration}ml</Text>
              <Text className="text-xs text-muted">Média diária</Text>
            </View>
            <View className="bg-primary/10 rounded-lg px-3 py-2">
              <Text className="text-xs font-semibold text-primary">{hydrationData.length} dias</Text>
            </View>
          </View>
          {renderHydrationChart()}
        </View>

        {/* Gráfico de Pressão */}
        <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-foreground">🫀 Pressão Arterial</Text>
              <Text className="text-2xl font-bold text-warning mt-1">
                {stats.avgSystolic}/{stats.avgDiastolic}
              </Text>
              <Text className="text-xs text-muted">Média mensal (mmHg)</Text>
            </View>
            <View className="bg-warning/10 rounded-lg px-3 py-2">
              <Text className="text-xs font-semibold text-warning">{pressureData.length} registros</Text>
            </View>
          </View>
          {renderPressureChart()}
        </View>

        {/* Gráfico de Pontos */}
        <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-foreground">🏆 Pontos Acumulados</Text>
              <Text className="text-2xl font-bold text-success mt-1">{stats.totalPoints}</Text>
              <Text className="text-xs text-muted">Total do mês</Text>
            </View>
            <View className="bg-success/10 rounded-lg px-3 py-2">
              <Text className="text-xs font-semibold text-success">{pointsData.length} atividades</Text>
            </View>
          </View>
          {renderPointsChart()}
        </View>

        {/* Resumo */}
        <View className="bg-primary/10 rounded-2xl p-4 border border-primary/20 gap-2">
          <Text className="text-sm font-semibold text-primary">📊 Resumo do Mês</Text>
          <Text className="text-xs text-foreground leading-relaxed">
            Você manteve uma média de <Text className="font-bold">{stats.avgHydration}ml</Text> de hidratação diária, registrou <Text className="font-bold">{pressureData.length}</Text> medições de pressão e acumulou <Text className="font-bold">{stats.totalPoints}</Text> pontos através de atividades e desafios.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
