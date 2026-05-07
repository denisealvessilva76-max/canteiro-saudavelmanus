import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const MOCK_AVISOS = [
  {
    id: 1,
    title: "🎉 Novo Desafio Disponível",
    description: "Desafio de Hidratação: Beba 2L de água por 7 dias consecutivos",
    category: "desafio",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    isUrgent: false,
    isRead: false,
  },
  {
    id: 2,
    title: "⚠️ Aviso Importante",
    description: "Manutenção do sistema prevista para amanhã às 22h",
    category: "urgente",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    isUrgent: true,
    isRead: false,
  },
  {
    id: 3,
    title: "📢 Comunicado Geral",
    description: "Lembramos que o check-in diário é importante para sua saúde",
    category: "informativo",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    isUrgent: false,
    isRead: true,
  },
  {
    id: 4,
    title: "🏆 Parabéns!",
    description: "Você atingiu 100 pontos! Continue assim!",
    category: "reconhecimento",
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    isUrgent: false,
    isRead: true,
  },
  {
    id: 5,
    title: "💊 Dica de Saúde",
    description: "Beba água regularmente ao longo do dia para manter-se hidratado",
    category: "saude",
    date: new Date(Date.now() - 72 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    isUrgent: false,
    isRead: true,
  },
];

export default function ComunicadosScreen() {
  const [activeFilter, setActiveFilter] = useState<"todos" | "urgente" | "informativo">("todos");
  const [avisos, setAvisos] = useState(MOCK_AVISOS);
  const [readIds, setReadIds] = useState<number[]>([]);

  useEffect(() => {
    loadReadStatus();
  }, []);

  const loadReadStatus = async () => {
    try {
      const readStr = await AsyncStorage.getItem("avisos:read");
      if (readStr) {
        setReadIds(JSON.parse(readStr));
      }
    } catch (error) {
      console.error("Erro ao carregar status de leitura:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const newReadIds = [...readIds, id];
      await AsyncStorage.setItem("avisos:read", JSON.stringify(newReadIds));
      setReadIds(newReadIds);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  const getFilteredAvisos = () => {
    return avisos.filter((aviso) => {
      if (activeFilter === "urgente") {
        return aviso.isUrgent;
      }
      if (activeFilter === "informativo") {
        return !aviso.isUrgent;
      }
      return true;
    });
  };

  const filteredAvisos = getFilteredAvisos();
  const unreadCount = avisos.filter((a) => !readIds.includes(a.id)).length;

  const renderAviso = ({ item }: { item: typeof MOCK_AVISOS[0] }) => {
    const isRead = readIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.avisoCard, isRead && styles.avisoCardRead]}
        onPress={() => !isRead && markAsRead(item.id)}
      >
        {!isRead && <View style={styles.unreadDot} />}

        <View style={styles.avisoContent}>
          <View style={styles.avisoHeader}>
            <Text style={[styles.avisoTitle, !isRead && styles.avisoTitleBold]}>
              {item.title}
            </Text>
            {item.isUrgent && <View style={styles.urgentBadge} />}
          </View>

          <Text style={styles.avisoDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.avisoFooter}>
            <Text style={styles.avisoCategory}>{item.category}</Text>
            <Text style={styles.avisoDate}>{item.date}</Text>
          </View>
        </View>

        {isRead && <Text style={styles.readCheck}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📢 Avisos</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} não lido(s)` : "Tudo lido"}
          </Text>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilter === "todos" && styles.filterBtnActive]}
            onPress={() => setActiveFilter("todos")}
          >
            <Text
              style={[
                styles.filterLabel,
                activeFilter === "todos" && styles.filterLabelActive,
              ]}
            >
              Todos ({avisos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, activeFilter === "urgente" && styles.filterBtnActive]}
            onPress={() => setActiveFilter("urgente")}
          >
            <Text
              style={[
                styles.filterLabel,
                activeFilter === "urgente" && styles.filterLabelActive,
              ]}
            >
              Urgente ({avisos.filter((a) => a.isUrgent).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFilter === "informativo" && styles.filterBtnActive,
            ]}
            onPress={() => setActiveFilter("informativo")}
          >
            <Text
              style={[
                styles.filterLabel,
                activeFilter === "informativo" && styles.filterLabelActive,
              ]}
            >
              Informativo ({avisos.filter((a) => !a.isUrgent).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Avisos */}
        <View style={styles.listContainer}>
          {filteredAvisos.length > 0 ? (
            filteredAvisos.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.avisoCard, readIds.includes(item.id) && styles.avisoCardRead]}
                onPress={() => !readIds.includes(item.id) && markAsRead(item.id)}
              >
                {!readIds.includes(item.id) && <View style={styles.unreadDot} />}

                <View style={styles.avisoContent}>
                  <View style={styles.avisoHeader}>
                    <Text
                      style={[
                        styles.avisoTitle,
                        !readIds.includes(item.id) && styles.avisoTitleBold,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.isUrgent && <View style={styles.urgentBadge} />}
                  </View>

                  <Text style={styles.avisoDescription} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.avisoFooter}>
                    <Text style={styles.avisoCategory}>{item.category}</Text>
                    <Text style={styles.avisoDate}>{item.date}</Text>
                  </View>
                </View>

                {readIds.includes(item.id) && <Text style={styles.readCheck}>✓</Text>}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Nenhum aviso nesta categoria</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: "#1B8A4C",
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  filterLabelActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  avisoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avisoCardRead: {
    backgroundColor: "#F9F9F9",
    borderColor: "#F0F0F0",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1B8A4C",
    marginTop: 6,
    flexShrink: 0,
  },
  avisoContent: {
    flex: 1,
    gap: 6,
  },
  avisoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  avisoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  avisoTitleBold: {
    fontWeight: "700",
    color: "#1B8A4C",
  },
  urgentBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
    flexShrink: 0,
    marginTop: 4,
  },
  avisoDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  avisoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  avisoCategory: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1B8A4C",
    backgroundColor: "#E8F5EE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "capitalize",
  },
  avisoDate: {
    fontSize: 10,
    color: "#999",
  },
  readCheck: {
    fontSize: 16,
    color: "#1B8A4C",
    fontWeight: "700",
    marginTop: 2,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
});
