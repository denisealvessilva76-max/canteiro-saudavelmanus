import { ScrollView, View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const TIPS = [
  "💧 Beba água regularmente ao longo do dia",
  "🧘 Faça alongamentos a cada 2 horas",
  "😊 Sua saúde mental é importante",
  "🏃 Caminhe 6.000 passos por dia",
  "🍎 Mantenha uma alimentação equilibrada",
  "😴 Durma 7-8 horas por noite",
  "🎯 Participe dos desafios semanais"
];

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [checkinToday, setCheckinToday] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [tipIndex, setTipIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await AsyncStorage.getItem("employee:profile");
      const pointsStr = await AsyncStorage.getItem("employee:points");
      const streakStr = await AsyncStorage.getItem("employee:streak");
      const todayCheckin = await AsyncStorage.getItem("today:checkin");
      
      if (profile) {
        setUserData(JSON.parse(profile));
      }
      
      setPoints(pointsStr ? parseInt(pointsStr) : 0);
      setStreak(streakStr ? parseInt(streakStr) : 0);
      setLevel(Math.floor((pointsStr ? parseInt(pointsStr) : 0) / 500) + 1);
      setCheckinToday(todayCheckin ? JSON.parse(todayCheckin) : null);
      setTipIndex(Math.floor(Math.random() * TIPS.length));
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const handleCheckin = async (status: "good" | "light" | "strong") => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const today = new Date().toISOString().split("T")[0];
      const checkinData = {
        status,
        timestamp: new Date().toISOString(),
        date: today
      };

      await AsyncStorage.setItem("today:checkin", JSON.stringify(checkinData));
      
      // Adicionar 10 pontos
      const newPoints = points + 10;
      await AsyncStorage.setItem("employee:points", newPoints.toString());
      
      setCheckinToday(checkinData);
      setPoints(newPoints);
      setLevel(Math.floor(newPoints / 500) + 1);

      Alert.alert("✅ Check-in Realizado!", "Você ganhou +10 pontos! Volte amanhã para continuar sua sequência.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível registrar o check-in");
    }
  };

  const navigateTo = (screen: string) => {
    if (screen === 'saude') {
      router.push('/(tabs)/saude');
    } else if (screen === 'ergonomia') {
      router.push('/(tabs)/ergonomia');
    } else if (screen === 'comunicados') {
      router.push('/(tabs)/comunicados');
    } else if (screen === 'perfil') {
      router.push('/(tabs)/perfil');
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="bg-white">
        <Text className="text-center text-gray-600">Carregando...</Text>
      </ScreenContainer>
    );
  }

  const statusEmoji = checkinToday 
    ? checkinToday.status === "good" ? "😊" 
    : checkinToday.status === "light" ? "😐" 
    : "😣"
    : "❓";

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header Verde */}
        <View style={styles.headerGreen}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Olá, {userData?.nome || "Funcionário"}! 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
          </View>
          <View style={styles.pointsBox}>
            <Text style={styles.pointsLabel}>Pontos</Text>
            <Text style={styles.pointsValue}>{points}</Text>
          </View>
        </View>

        {/* Barra de Sequência */}
        <View style={styles.sequenceContainer}>
          <Text style={styles.sequenceLabel}>Sua Sequência: {streak} dias 🔥</Text>
          <View style={styles.sequenceDots}>
            {[...Array(7)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i < streak ? "#1B8A4C" : "#E5E7EB" }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Card de Check-in */}
        <View style={styles.checkinCard}>
          <Text style={styles.checkinTitle}>📋 Como você está hoje?</Text>
          <Text style={styles.checkinSubtitle}>
            {checkinToday 
              ? `Check-in realizado ${statusEmoji}` 
              : "Registre seu bem-estar"}
          </Text>

          {!checkinToday ? (
            <View style={styles.checkinOptions}>
              <TouchableOpacity
                style={[styles.checkinBtn, styles.checkinGood]}
                onPress={() => handleCheckin("good")}
              >
                <Text style={styles.checkinEmoji}>😊</Text>
                <Text style={styles.checkinLabel}>Tudo bem!</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkinBtn, styles.checkinLight]}
                onPress={() => handleCheckin("light")}
              >
                <Text style={styles.checkinEmoji}>😐</Text>
                <Text style={styles.checkinLabel}>Dor leve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkinBtn, styles.checkinStrong]}
                onPress={() => handleCheckin("strong")}
              >
                <Text style={styles.checkinEmoji}>😣</Text>
                <Text style={styles.checkinLabel}>Dor forte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.checkinDone}>
              <Text style={styles.checkinDoneText}>
                Obrigado por registrar seu bem-estar! 💚
              </Text>
            </View>
          )}
        </View>

        {/* Atalhos Rápidos 2x2 */}
        <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigateTo("saude")}
          >
            <Text style={styles.quickActionEmoji}>💧</Text>
            <Text style={styles.quickActionLabel}>Hidratação</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigateTo("saude")}
          >
            <Text style={styles.quickActionEmoji}>🫀</Text>
            <Text style={styles.quickActionLabel}>Pressão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigateTo("ergonomia")}
          >
            <Text style={styles.quickActionEmoji}>🧘</Text>
            <Text style={styles.quickActionLabel}>Ergonomia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => Alert.alert("Desafios", "Funcionalidade em breve")}
          >
            <Text style={styles.quickActionEmoji}>🏆</Text>
            <Text style={styles.quickActionLabel}>Desafios</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo Semanal */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Resumo da Semana</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-ins:</Text>
            <Text style={styles.summaryValue}>{streak}/7</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Água hoje:</Text>
            <Text style={styles.summaryValue}>--</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pontos:</Text>
            <Text style={styles.summaryValue}>{points}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nível:</Text>
            <Text style={styles.summaryValue}>{level}</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <TouchableOpacity style={styles.badge}>
            <Text style={styles.badgeEmoji}>🏆</Text>
            <Text style={styles.badgeLabel}>Ranking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.badge}>
            <Text style={styles.badgeEmoji}>⭐</Text>
            <Text style={styles.badgeLabel}>Conquistas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎁</Text>
            <Text style={styles.badgeLabel}>Prêmios</Text>
          </TouchableOpacity>
        </View>

        {/* Dica do Dia */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Dica do Dia</Text>
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerGreen: {
    backgroundColor: "#1B8A4C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#E8F5EE",
  },
  pointsBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 12,
    color: "#E8F5EE",
    fontWeight: "600",
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sequenceContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sequenceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B8A4C",
    marginBottom: 8,
  },
  sequenceDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkinCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 4,
  },
  checkinSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  checkinOptions: {
    flexDirection: "row",
    gap: 8,
  },
  checkinBtn: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  checkinGood: {
    backgroundColor: "#D4EDDA",
  },
  checkinLight: {
    backgroundColor: "#FFF3CD",
  },
  checkinStrong: {
    backgroundColor: "#F8D7DA",
  },
  checkinEmoji: {
    fontSize: 24,
  },
  checkinLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  checkinDone: {
    backgroundColor: "#D4EDDA",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  checkinDoneText: {
    color: "#155724",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 12,
    marginHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  quickActionBtn: {
    width: "48%",
    backgroundColor: "#E8F5EE",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#27AE60",
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B8A4C",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  badge: {
    flex: 1,
    backgroundColor: "#E8F5EE",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#27AE60",
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1B8A4C",
  },
  tipCard: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F39C12",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
