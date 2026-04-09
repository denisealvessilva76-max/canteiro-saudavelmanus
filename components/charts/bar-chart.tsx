import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface BarChartProps {
  data: { x: number | string; y: number }[];
  title: string;
  yLabel?: string;
  color?: string;
}

export function BarChart({ data, title, yLabel, color }: BarChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.min(screenWidth - 48, 380);
  
  // Encontrar o valor máximo para escala
  const maxValue = Math.max(...data.map(d => d.y), 1);
  const barHeight = 200;

  return (
    <View className="bg-surface rounded-xl p-4 border border-border">
      <Text className="text-lg font-semibold text-foreground mb-1">{title}</Text>
      {yLabel && <Text className="text-sm text-muted mb-3">{yLabel}</Text>}
      
      {/* Gráfico de barras simples */}
      <View className="flex-row items-end justify-around" style={{ height: barHeight + 20 }}>
        {data.map((item, idx) => {
          const barHeightPercent = (item.y / maxValue) * barHeight;
          return (
            <View key={idx} className="items-center flex-1 mx-1">
              <View
                className="rounded-t"
                style={{
                  width: "80%",
                  height: barHeightPercent,
                  backgroundColor: color || colors.primary,
                }}
              />
              <Text className="text-xs text-muted mt-2">{item.x}</Text>
            </View>
          );
        })}
      </View>
      
      {/* Legenda de valores */}
      <View className="mt-4 pt-4 border-t border-border">
        <Text className="text-xs text-muted">
          Máximo: {maxValue} | Itens: {data.length}
        </Text>
      </View>
    </View>
  );
}
