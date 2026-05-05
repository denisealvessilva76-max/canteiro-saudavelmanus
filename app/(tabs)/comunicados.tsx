import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";

const comunicadosDefault = [
  {
    id: 1,
    titulo: "Bem-vindo ao Canteiro Saudável!",
    descricao: "Seu aplicativo de saúde e bem-estar no trabalho",
    categoria: "geral",
    data: "Hoje",
    lido: false,
  },
  {
    id: 2,
    titulo: "Desafio de Hidratação",
    descricao: "Participe do desafio e ganhe 50 pontos",
    categoria: "desafio",
    data: "Ontem",
    lido: false,
  },
  {
    id: 3,
    titulo: "Novo Prêmio Disponível",
    descricao: "Resgate seus pontos por um brinde especial",
    categoria: "recompensa",
    data: "2 dias atrás",
    lido: true,
  },
];

export default function ComunicadosScreen() {
  const [comunicados, setComunicados] = useState(comunicadosDefault);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    loadComunicados();
  }, []);

  const loadComunicados = async () => {
    try {
      const saved = await AsyncStorage.getItem("comunicados:list");
      if (saved) {
        setComunicados(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erro ao carregar comunicados:", error);
    }
  };

  const filtrados = comunicados.filter((c) => {
    if (filtro === "todos") return true;
    return c.categoria === filtro;
  });

  const marcarComoLido = async (id: number) => {
    const updated = comunicados.map((c) =>
      c.id === id ? { ...c, lido: true } : c
    );
    setComunicados(updated);
    await AsyncStorage.setItem("comunicados:list", JSON.stringify(updated));
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "desafio":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "recompensa":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "saude":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case "desafio":
        return "🎯 Desafio";
      case "recompensa":
        return "🎁 Recompensa";
      case "saude":
        return "❤️ Saúde";
      default:
        return "📢 Geral";
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">Avisos 📢</Text>
            <Text className="text-sm text-muted mt-1">
              {filtrados.length} mensagem{filtrados.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View className="flex-row gap-2 flex-wrap">
            {["todos", "geral", "desafio", "recompensa", "saude"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFiltro(f)}
                className={`px-4 py-2 rounded-full ${
                  filtro === f
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    filtro === f ? "text-white" : "text-foreground"
                  }`}
                >
                  {f === "todos"
                    ? "Todos"
                    : f === "geral"
                    ? "Geral"
                    : f === "desafio"
                    ? "Desafios"
                    : f === "recompensa"
                    ? "Recompensas"
                    : "Saúde"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="gap-3">
            {filtrados.length > 0 ? (
              filtrados.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => marcarComoLido(item.id)}
                  className={`rounded-lg p-4 border-2 ${getCategoryColor(
                    item.categoria
                  )}`}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-sm font-semibold text-foreground">
                          {getCategoryLabel(item.categoria)}
                        </Text>
                        {!item.lido && (
                          <View className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </View>
                      <Text className="text-base font-bold text-foreground">
                        {item.titulo}
                      </Text>
                      <Text className="text-sm text-muted mt-1">
                        {item.descricao}
                      </Text>
                      <Text className="text-xs text-muted mt-2">
                        {item.data}
                      </Text>
                    </View>
                    <Text className="text-xl">
                      {item.lido ? "✓" : "●"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-4xl mb-2">📭</Text>
                <Text className="text-base text-muted">
                  Nenhum aviso nesta categoria
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
