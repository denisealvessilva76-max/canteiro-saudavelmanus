import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface LineChartProps {
  data: { x: number | string; y: number }[];
  title: string;
  yLabel?: string;
  color?: string;
}

export function LineChart({ data, title, yLabel, color }: LineChartProps) {
  const colors = useColors();
  
  // Encontrar o valor máximo para escala
  const maxValue = Math.max(...data.map(d => d.y), 1);
  const minValue = Math.min(...data.map(d => d.y), 0);
  const range = maxValue - minValue || 1;
  const chartHeight = 200;
  const chartWidth = Dimensions.get("window").width - 48;

  return (
    <View className="bg-surface rounded-xl p-4 border border-border">
      <Text className="text-lg font-semibold text-foreground mb-1">{title}</Text>
      {yLabel && <Text className="text-sm text-muted mb-3">{yLabel}</Text>}
      
      {/* Gráfico de linha simples */}
      <View className="mb-4" style={{ height: chartHeight }}>
        {/* Pontos do gráfico */}
        <View className="flex-1 flex-row items-end justify-between">
          {data.map((item, idx) => {
            const yPercent = ((item.y - minValue) / range) * 100;
            return (
              <View
                key={idx}
                className="items-center flex-1"
                style={{ justifyContent: "flex-end" }}
              >
                {/* Ponto */}
                <View
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: color || colors.primary,
                    marginBottom: `${yPercent}%`,
                  }}
                />
                {/* Label X */}
                <Text className="text-xs text-muted mt-2 text-center">
                  {String(item.x).substring(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Legenda de valores */}
      <View className="pt-4 border-t border-border">
        <Text className="text-xs text-muted">
          Mín: {minValue.toFixed(1)} | Máx: {maxValue.toFixed(1)} | Pontos: {data.length}
        </Text>
      </View>
    </View>
  );
}
