import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

const alongamentos = [
  {
    id: 1,
    nome: "Alongamento de Pescoço",
    descricao: "Alivie a tensão do pescoço com movimentos suaves",
    duracao: "2 min",
    emoji: "🧠",
    youtube: "https://www.youtube.com/results?search_query=alongamento+pescoço",
  },
  {
    id: 2,
    nome: "Alongamento de Ombros",
    descricao: "Reduza a tensão nos ombros e costas",
    duracao: "3 min",
    emoji: "💪",
    youtube: "https://www.youtube.com/results?search_query=alongamento+ombros",
  },
  {
    id: 3,
    nome: "Alongamento de Coluna",
    descricao: "Melhore a postura e flexibilidade da coluna",
    duracao: "4 min",
    emoji: "🔄",
    youtube: "https://www.youtube.com/results?search_query=alongamento+coluna",
  },
  {
    id: 4,
    nome: "Alongamento de Pulsos",
    descricao: "Previna lesões por esforço repetitivo",
    duracao: "2 min",
    emoji: "✋",
    youtube: "https://www.youtube.com/results?search_query=alongamento+pulsos",
  },
  {
    id: 5,
    nome: "Alongamento de Pernas",
    descricao: "Melhore a circulação e flexibilidade das pernas",
    duracao: "5 min",
    emoji: "🦵",
    youtube: "https://www.youtube.com/results?search_query=alongamento+pernas",
  },
  {
    id: 6,
    nome: "Alongamento de Quadril",
    descricao: "Alivie a tensão do quadril e glúteos",
    duracao: "3 min",
    emoji: "🪑",
    youtube: "https://www.youtube.com/results?search_query=alongamento+quadril",
  },
];

export default function ErgonomiaScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleOpenYoutube = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Erro ao abrir YouTube:", error);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">Ergonomia 🧘</Text>
            <Text className="text-sm text-muted mt-1">
              Alongamentos e exercícios guiados para melhorar sua postura
            </Text>
          </View>

          <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 gap-2">
            <Text className="text-sm font-bold text-orange-900 dark:text-orange-100">
              💡 Dica: Faça alongamentos a cada 1 hora de trabalho
            </Text>
          </View>

          <View className="gap-3">
            {alongamentos.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="bg-surface rounded-lg border border-border overflow-hidden"
              >
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-3xl">{item.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">
                        {item.nome}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        ⏱️ {item.duracao}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xl">
                    {expandedId === item.id ? "▼" : "▶"}
                  </Text>
                </View>

                {expandedId === item.id && (
                  <View className="bg-background px-4 py-3 border-t border-border gap-3">
                    <Text className="text-sm text-foreground leading-relaxed">
                      {item.descricao}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleOpenYoutube(item.youtube)}
                      className="bg-red-500 rounded-lg py-2 items-center flex-row justify-center gap-2"
                    >
                      <Text className="text-white font-bold">▶ Ver no YouTube</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <Text className="text-base font-bold text-foreground">📋 Dicas de Postura</Text>
            <View className="gap-2">
              <TipItem text="Mantenha a coluna reta e apoiada na cadeira" />
              <TipItem text="Pés apoiados no chão ou descanso" />
              <TipItem text="Cotovelos em ângulo de 90 graus" />
              <TipItem text="Tela do computador ao nível dos olhos" />
              <TipItem text="Faça pausas a cada 1 hora" />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <Text className="text-base">✓</Text>
      <Text className="text-sm text-foreground flex-1">{text}</Text>
    </View>
  );
}
