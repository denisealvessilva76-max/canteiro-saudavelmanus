import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const REWARDS = [
  {
    id: 1,
    title: "Vale-Compras R$50",
    description: "Vale para compras na loja da empresa",
    points: 500,
    category: "vale",
    icon: "🎁",
    stock: 10,
  },
  {
    id: 2,
    title: "Brinde Exclusivo",
    description: "Camiseta personalizada do Canteiro Saudável",
    points: 300,
    category: "brinde",
    icon: "👕",
    stock: 5,
  },
  {
    id: 3,
    title: "Dia Livre",
    description: "1 dia de folga extra",
    points: 1000,
    category: "beneficio",
    icon: "📅",
    stock: 3,
  },
  {
    id: 4,
    title: "Massagem Relaxante",
    description: "Sessão de 1 hora com massagista",
    points: 400,
    category: "beneficio",
    icon: "💆",
    stock: 8,
  },
  {
    id: 5,
    title: "Garrafa Térmica",
    description: "Garrafa térmica personalizada 500ml",
    points: 250,
    category: "brinde",
    icon: "🧊",
    stock: 15,
  },
  {
    id: 6,
    title: "Vale-Refeição R$100",
    description: "Vale para refeição em restaurantes parceiros",
    points: 800,
    category: "vale",
    icon: "🍽️",
    stock: 7,
  },
];

export default function RecompensasScreen() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [redeemed, setRedeemed] = useState<any[]>([]);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"disponiveis" | "resgatados">("disponiveis");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pointsStr = await AsyncStorage.getItem("user:points");
      const redeemedStr = await AsyncStorage.getItem("user:redeemed_rewards");

      if (pointsStr) {
        setPoints(parseInt(pointsStr));
      }

      if (redeemedStr) {
        setRedeemed(JSON.parse(redeemedStr));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleRedeem = (reward: any) => {
    if (points < reward.points) {
      Alert.alert("❌ Pontos Insuficientes", `Você precisa de ${reward.points} pontos`);
      return;
    }

    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;

    setLoading(true);

    try {
      const newPoints = points - selectedReward.points;
      const newRedeemed = [
        {
          id: Date.now(),
          ...selectedReward,
          redeemedAt: new Date().toLocaleString("pt-BR"),
        },
        ...redeemed,
      ];

      await AsyncStorage.setItem("user:points", newPoints.toString());
      await AsyncStorage.setItem("user:redeemed_rewards", JSON.stringify(newRedeemed));

      setPoints(newPoints);
      setRedeemed(newRedeemed);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("✅ Sucesso", "Recompensa resgatada com sucesso!");
      setShowRedeemModal(false);
      setSelectedReward(null);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível resgatar a recompensa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎁 Recompensas</Text>
          <Text style={styles.subtitle}>Resgate seus pontos por prêmios</Text>
        </View>

        {/* Pontos */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsContent}>
            <Text style={styles.pointsLabel}>Seus Pontos</Text>
            <Text style={styles.pointsValue}>{points}</Text>
          </View>
          <View style={styles.pointsIcon}>
            <Text style={styles.pointsIconText}>⭐</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["disponiveis", "resgatados"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === "disponiveis" ? "🎯 Disponíveis" : "✅ Resgatados"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recompensas Disponíveis */}
        {activeTab === "disponiveis" && (
          <View style={styles.content}>
            {REWARDS.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                  </View>
                </View>

                <View style={styles.rewardFooter}>
                  <View style={styles.rewardPoints}>
                    <Text style={styles.rewardPointsValue}>{reward.points}</Text>
                    <Text style={styles.rewardPointsLabel}>pontos</Text>
                  </View>

                  <View style={styles.rewardStock}>
                    <Text style={styles.rewardStockText}>
                      {reward.stock > 0 ? `${reward.stock} disponíveis` : "Fora de estoque"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.redeemBtn,
                      (points < reward.points || reward.stock === 0) && styles.redeemBtnDisabled,
                    ]}
                    onPress={() => handleRedeem(reward)}
                    disabled={points < reward.points || reward.stock === 0}
                  >
                    <Text style={styles.redeemBtnText}>Resgatar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recompensas Resgatadas */}
        {activeTab === "resgatados" && (
          <View style={styles.content}>
            {redeemed.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🎁</Text>
                <Text style={styles.emptyStateText}>Nenhuma recompensa resgatada ainda</Text>
                <Text style={styles.emptyStateSubtext}>
                  Acumule pontos e resgate suas recompensas!
                </Text>
              </View>
            ) : (
              redeemed.map((reward) => (
                <View key={reward.id} style={styles.redeemedCard}>
                  <View style={styles.redeemedHeader}>
                    <Text style={styles.redeemedIcon}>{reward.icon}</Text>
                    <View style={styles.redeemedInfo}>
                      <Text style={styles.redeemedTitle}>{reward.title}</Text>
                      <Text style={styles.redeemedDate}>{reward.redeemedAt}</Text>
                    </View>
                  </View>

                  <View style={styles.redeemedBadge}>
                    <Text style={styles.redeemedBadgeText}>✓ Resgatado</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Dicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Como Ganhar Pontos</Text>
          <TipCard emoji="✓" title="Check-in Diário" text="+10 pontos por check-in" />
          <TipCard emoji="📸" title="Desafios" text="+20-50 pontos por desafio" />
          <TipCard emoji="🎯" title="Sequência" text="+5 pontos por dia de sequência" />
          <TipCard emoji="🏆" title="Conquistas" text="+100 pontos por conquista" />
        </View>
      </ScrollView>

      {/* Modal de Confirmação */}
      <Modal visible={showRedeemModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>{selectedReward?.icon}</Text>

            <Text style={styles.modalTitle}>Confirmar Resgate</Text>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoTitle}>{selectedReward?.title}</Text>
              <Text style={styles.modalInfoDescription}>{selectedReward?.description}</Text>
            </View>

            <View style={styles.modalCost}>
              <Text style={styles.modalCostLabel}>Custo:</Text>
              <Text style={styles.modalCostValue}>{selectedReward?.points} pontos</Text>
            </View>

            <View style={styles.modalBalance}>
              <Text style={styles.modalBalanceLabel}>Seus pontos:</Text>
              <Text style={styles.modalBalanceValue}>{points}</Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowRedeemModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtn}
                onPress={confirmRedeem}
                disabled={loading}
              >
                <Text style={styles.modalBtnText}>
                  {loading ? "Processando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function TipCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipEmoji}>{emoji}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B8A4C",
    marginBottom: 8,
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
  pointsCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#1B8A4C",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsContent: {
    gap: 4,
  },
  pointsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pointsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  pointsIconText: {
    fontSize: 32,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#1B8A4C",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rewardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 12,
  },
  rewardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  rewardIcon: {
    fontSize: 32,
  },
  rewardInfo: {
    flex: 1,
    gap: 2,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  rewardDescription: {
    fontSize: 12,
    color: "#666",
  },
  rewardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rewardPoints: {
    alignItems: "center",
    gap: 2,
  },
  rewardPointsValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
  },
  rewardPointsLabel: {
    fontSize: 10,
    color: "#666",
  },
  rewardStock: {
    flex: 1,
  },
  rewardStockText: {
    fontSize: 11,
    color: "#666",
  },
  redeemBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  redeemBtnDisabled: {
    opacity: 0.5,
  },
  redeemBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateIcon: {
    fontSize: 48,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  redeemedCard: {
    backgroundColor: "#E8F5EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  redeemedHeader: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  redeemedIcon: {
    fontSize: 28,
  },
  redeemedInfo: {
    flex: 1,
    gap: 2,
  },
  redeemedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  redeemedDate: {
    fontSize: 11,
    color: "#666",
  },
  redeemedBadge: {
    backgroundColor: "#1B8A4C",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  redeemedBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    flexDirection: "row",
    gap: 12,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  tipText: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    gap: 16,
    alignItems: "center",
  },
  modalIcon: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  modalInfo: {
    width: "100%",
    backgroundColor: "#E8F5EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    padding: 12,
    gap: 4,
  },
  modalInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  modalInfoDescription: {
    fontSize: 12,
    color: "#666",
  },
  modalCost: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalCostLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  modalCostValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
  },
  modalBalance: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalBalanceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  modalBalanceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  modalFooter: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#F0F0F0",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  modalBtnCancelText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 14,
  },
});
