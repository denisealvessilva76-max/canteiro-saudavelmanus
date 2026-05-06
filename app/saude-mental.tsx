import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Linking, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const CONTACTS = [
  {
    id: 1,
    name: "Psicólogo",
    phone: "(11) 98765-4321",
    email: "psicologo@empresa.com",
    icon: "🧠",
    description: "Apoio emocional e psicológico",
  },
  {
    id: 2,
    name: "Assistente Social",
    phone: "(11) 98765-4322",
    email: "social@empresa.com",
    icon: "🤝",
    description: "Orientação social e benefícios",
  },
  {
    id: 3,
    name: "Médico",
    phone: "(11) 98765-4323",
    email: "medico@empresa.com",
    icon: "⚕️",
    description: "Consultas e prescrições",
  },
  {
    id: 4,
    name: "Emergência",
    phone: "192",
    email: "emergencia@empresa.com",
    icon: "🚨",
    description: "Atendimento de emergência",
  },
];

const WELLBEING_PILLARS = [
  {
    id: 1,
    title: "Físico",
    icon: "💪",
    description: "Exercícios, alongamentos e movimento",
    color: "#FF6B6B",
  },
  {
    id: 2,
    title: "Mental",
    icon: "🧠",
    description: "Meditação, respiração e foco",
    color: "#4ECDC4",
  },
  {
    id: 3,
    title: "Emocional",
    icon: "❤️",
    description: "Relacionamentos e autoestima",
    color: "#FFE66D",
  },
  {
    id: 4,
    title: "Social",
    icon: "👥",
    description: "Conexões e comunidade",
    color: "#95E1D3",
  },
];

export default function SaudeMentalScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"contatos" | "mapa" | "respiracao">("contatos");
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev >= 3) {
            setBreathingPhase((phase) => {
              if (phase === "inhale") return "hold";
              if (phase === "hold") return "exhale";
              if (phase === "exhale") return "rest";
              return "inhale";
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBreathing]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsApp = (phone: string) => {
    const message = "Olá, gostaria de agendar uma consulta.";
    Linking.openURL(`https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`);
  };

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🧠 Saúde Mental</Text>
          <Text style={styles.subtitle}>Cuidando do seu bem-estar</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["contatos", "mapa", "respiracao"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === "contatos"
                  ? "📞 Contatos"
                  : tab === "mapa"
                  ? "🗺️ Mapa"
                  : "🫁 Respiração"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contatos */}
        {activeTab === "contatos" && (
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Profissionais de Apoio</Text>
            <Text style={styles.contentSubtitle}>
              Entre em contato com nossos profissionais de saúde mental
            </Text>

            <View style={styles.contactsList}>
              {CONTACTS.map((contact) => (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <Text style={styles.contactIcon}>{contact.icon}</Text>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactDescription}>{contact.description}</Text>
                    </View>
                  </View>

                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCall(contact.phone)}
                    >
                      <Text style={styles.actionBtnText}>📞 Ligar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleWhatsApp(contact.phone)}
                    >
                      <Text style={styles.actionBtnText}>💬 WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEmail(contact.email)}
                    >
                      <Text style={styles.actionBtnText}>✉️ Email</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mapa Mental */}
        {activeTab === "mapa" && (
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Mapa de Bem-Estar</Text>
            <Text style={styles.contentSubtitle}>
              Os 4 pilares do bem-estar integral
            </Text>

            <View style={styles.pillarsContainer}>
              {WELLBEING_PILLARS.map((pillar) => (
                <TouchableOpacity key={pillar.id} style={styles.pillarCard}>
                  <View
                    style={[
                      styles.pillarIcon,
                      { backgroundColor: pillar.color + "20" },
                    ]}
                  >
                    <Text style={styles.pillarIconText}>{pillar.icon}</Text>
                  </View>
                  <Text style={styles.pillarTitle}>{pillar.title}</Text>
                  <Text style={styles.pillarDescription}>{pillar.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dicas */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Dicas Diárias</Text>
              <View style={styles.tipCard}>
                <Text style={styles.tipEmoji}>🧘</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Meditação</Text>
                  <Text style={styles.tipDescription}>
                    Reserve 5 minutos por dia para meditar e relaxar
                  </Text>
                </View>
              </View>
              <View style={styles.tipCard}>
                <Text style={styles.tipEmoji}>🚶</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Caminhada</Text>
                  <Text style={styles.tipDescription}>
                    Caminhe 30 minutos diários para melhorar o humor
                  </Text>
                </View>
              </View>
              <View style={styles.tipCard}>
                <Text style={styles.tipEmoji}>😴</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Sono</Text>
                  <Text style={styles.tipDescription}>
                    Durma 7-8 horas por noite para recuperação
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Respiração */}
        {activeTab === "respiracao" && (
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Técnica de Respiração 4-7-8</Text>
            <Text style={styles.contentSubtitle}>
              Uma técnica comprovada para reduzir ansiedade e estresse
            </Text>

            <TouchableOpacity
              style={styles.breathingBtn}
              onPress={() => setShowBreathingModal(true)}
            >
              <Text style={styles.breathingBtnText}>🫁 Iniciar Respiração Guiada</Text>
            </TouchableOpacity>

            <View style={styles.breathingInfo}>
              <Text style={styles.breathingInfoTitle}>Como funciona:</Text>
              <Text style={styles.breathingInfoText}>
                1. Inspire por 4 segundos{"\n"}
                2. Prenda a respiração por 7 segundos{"\n"}
                3. Expire por 8 segundos{"\n"}
                4. Repita 4 vezes
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>✨ Benefícios:</Text>
              <BenefitItem text="Reduz ansiedade e estresse" />
              <BenefitItem text="Melhora o foco e concentração" />
              <BenefitItem text="Normaliza a pressão arterial" />
              <BenefitItem text="Promove relaxamento profundo" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Respiração */}
      <Modal visible={showBreathingModal} transparent animationType="fade">
        <View style={styles.breathingModalOverlay}>
          <View style={styles.breathingModalContent}>
            <TouchableOpacity
              style={styles.breathingModalClose}
              onPress={() => {
                setShowBreathingModal(false);
                setIsBreathing(false);
              }}
            >
              <Text style={styles.breathingModalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.breathingModalTitle}>Respiração Guiada 4-7-8</Text>

            {/* Circle Animation */}
            <View style={styles.breathingCircleContainer}>
              <View
                style={[
                  styles.breathingCircle,
                  {
                    transform: [
                      {
                        scale:
                          breathingPhase === "inhale"
                            ? 1 + breathingCount * 0.3
                            : breathingPhase === "exhale"
                            ? 1.9 - breathingCount * 0.3
                            : 1.9,
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* Phase Text */}
            <Text style={styles.breathingPhaseText}>
              {breathingPhase === "inhale"
                ? `Inspire (${4 - breathingCount}s)`
                : breathingPhase === "hold"
                ? `Prenda (${7 - breathingCount}s)`
                : breathingPhase === "exhale"
                ? `Expire (${8 - breathingCount}s)`
                : `Descanse (${4 - breathingCount}s)`}
            </Text>

            {/* Start/Stop Button */}
            <TouchableOpacity
              style={[styles.breathingStartBtn, isBreathing && styles.breathingStopBtn]}
              onPress={() => setIsBreathing(!isBreathing)}
            >
              <Text style={styles.breathingStartBtnText}>
                {isBreathing ? "⏸ Pausar" : "▶ Começar"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.breathingHint}>
              Siga o ritmo do círculo e respire naturalmente
            </Text>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>✓</Text>
      <Text style={styles.benefitText}>{text}</Text>
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
    paddingVertical: 20,
    gap: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  contentSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 12,
  },
  contactHeader: {
    flexDirection: "row",
    gap: 12,
  },
  contactIcon: {
    fontSize: 32,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  contactDescription: {
    fontSize: 12,
    color: "#666",
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#E8F5EE",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1B8A4C",
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1B8A4C",
  },
  pillarsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pillarCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  pillarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pillarIconText: {
    fontSize: 24,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  pillarDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  tipsContainer: {
    gap: 10,
  },
  tipsTitle: {
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
    alignItems: "flex-start",
  },
  tipEmoji: {
    fontSize: 24,
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
  tipDescription: {
    fontSize: 12,
    color: "#666",
  },
  breathingBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  breathingBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  breathingInfo: {
    backgroundColor: "#E8F5EE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    padding: 12,
    gap: 8,
  },
  breathingInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  breathingInfoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  benefitsContainer: {
    gap: 10,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  benefitItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 6,
  },
  benefitIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  benefitText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  breathingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  breathingModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "90%",
    gap: 20,
  },
  breathingModalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  breathingModalCloseText: {
    fontSize: 20,
    color: "#666",
  },
  breathingModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
    marginTop: 12,
  },
  breathingCircleContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  breathingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1B8A4C",
    opacity: 0.6,
  },
  breathingPhaseText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  breathingStartBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  breathingStopBtn: {
    backgroundColor: "#FF6B6B",
  },
  breathingStartBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  breathingHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
