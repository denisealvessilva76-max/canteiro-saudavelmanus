import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';

const screenWidth = Dimensions.get('window').width;

export interface StatsChartProps {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any;
  height?: number;
  showLegend?: boolean;
}

/**
 * Componente de gráfico simplificado (sem dependência externa)
 * Renderiza gráficos básicos usando componentes nativos
 */
export function StatsChart({
  type,
  title,
  data,
  height = 220,
  showLegend = true,
}: StatsChartProps) {
  const colors = useColors();

  const renderBarChart = () => {
    if (!data.datasets || !data.datasets[0]) return null;
    
    const values = data.datasets[0].data || [];
    const maxValue = Math.max(...values, 1);
    const barWidth = (screenWidth - 60) / Math.max(values.length, 1);

    return (
      <View style={{ height }}>
        <View className="flex-row items-flex-end justify-around px-4" style={{ height: height - 40 }}>
          {values.map((value: number, idx: number) => (
            <View key={idx} className="items-center">
              <View
                style={{
                  width: barWidth - 8,
                  height: (value / maxValue) * (height - 60),
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          ))}
        </View>
        <View className="flex-row justify-around px-4 mt-2">
          {data.labels?.map((label: string, idx: number) => (
            <Text key={idx} className="text-xs text-muted" style={{ width: barWidth - 8 }}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    if (!data.datasets || !data.datasets[0]) return null;

    const values = data.datasets[0].data || [];
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    const pointSpacing = (screenWidth - 60) / Math.max(values.length - 1, 1);

    return (
      <View style={{ height }}>
        {/* Grid de fundo */}
        <View className="absolute w-full" style={{ height: height - 40, top: 0, left: 20 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: screenWidth - 60,
                height: 1,
                backgroundColor: colors.border,
                top: ((height - 40) / 4) * i,
              }}
            />
          ))}
        </View>

        {/* Pontos e linha */}
        <View className="flex-row items-flex-end px-5" style={{ height: height - 40 }}>
          {values.map((value: number, idx: number) => {
            const normalizedValue = (value - minValue) / range;
            const yPos = (height - 60) * (1 - normalizedValue);

            return (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  left: 20 + idx * pointSpacing,
                  top: yPos,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                }}
              />
            );
          })}
        </View>

        {/* Labels */}
        <View className="flex-row justify-around px-4 mt-2">
          {data.labels?.map((label: string, idx: number) => (
            <Text key={idx} className="text-xs text-muted">
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    return (
      <View className="items-center justify-center" style={{ height }}>
        <Text className="text-sm text-muted">Gráfico de pizza</Text>
      </View>
    );
  };

  return (
    <View className="bg-surface rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-foreground mb-3">{title}</Text>

      {type === 'line' && renderLineChart()}
      {type === 'bar' && renderBarChart()}
      {type === 'pie' && renderPieChart()}
    </View>
  );
}

// Componentes específicos para cada tipo de gráfico

export interface PointsChartProps {
  data: Array<{ day: string; points: number }>;
}

export function PointsChart({ data }: PointsChartProps) {
  const chartData: any = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        data: data.map((d) => d.points),
      },
    ],
  };

  return (
    <StatsChart
      type="line"
      title="Evolução de Pontos (Últimos 30 dias)"
      data={chartData}
      height={250}
    />
  );
}

export interface HydrationChartProps {
  data: Array<{ day: string; cups: number; goal: number }>;
}

export function HydrationChart({ data }: HydrationChartProps) {
  const chartData: any = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        data: data.map((d) => d.cups),
      },
    ],
  };

  return (
    <StatsChart
      type="line"
      title="Hidratação Semanal (Copos)"
      data={chartData}
      height={220}
    />
  );
}

export interface PressureChartProps {
  data: Array<{ day: string; systolic: number; diastolic: number }>;
}

export function PressureChart({ data }: PressureChartProps) {
  const chartData: any = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        data: data.map((d) => d.systolic),
      },
    ],
  };

  return (
    <StatsChart
      type="line"
      title="Pressão Arterial (Tendência)"
      data={chartData}
      height={250}
    />
  );
}

export interface ComparisonChartProps {
  userValue: number;
  averageValue: number;
  label: string;
  unit: string;
}

export function ComparisonChart({
  userValue,
  averageValue,
  label,
  unit,
}: ComparisonChartProps) {
  const chartData: any = {
    labels: ['Você', 'Média Geral'],
    datasets: [
      {
        data: [userValue, averageValue],
      },
    ],
  };

  return (
    <View className="bg-surface rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-foreground mb-2">{label}</Text>
      <View className="flex-row justify-around mb-4">
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary">
            {userValue.toFixed(1)}
          </Text>
          <Text className="text-sm text-muted">Você</Text>
          <Text className="text-xs text-muted">{unit}</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-success">
            {averageValue.toFixed(1)}
          </Text>
          <Text className="text-sm text-muted">Média</Text>
          <Text className="text-xs text-muted">{unit}</Text>
        </View>
      </View>
      <StatsChart
        type="bar"
        title=""
        data={chartData}
        height={150}
        showLegend={false}
      />
    </View>
  );
}
