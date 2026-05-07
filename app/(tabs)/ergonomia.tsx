import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";

const alongamentos = [
  {
    id: 1,
    nome: "Alongamento de Pescoço",
    descricao: "Incline a cabeça para cada lado, mantendo por 15-20 segundos. Repita 3 vezes.",
    duracao: "2 min",
    emoji: "🧠",
    youtube: "https://www.youtube.com/results?search_query=alongamento+pescoço",
    beneficio: "Alivia tensão cervical"
  },
  {
    id: 2,
    nome: "Alongamento de Ombros",
    descricao: "Passe o braço sobre o peito e puxe com a outra mão. Mantenha 20 segundos cada lado.",
    duracao: "3 min",
    emoji: "💪",
    youtube: "https://www.youtube.com/results?search_query=alongamento+ombros",
    beneficio: "Reduz tensão nos ombros"
  },
  {
    id: 3,
    nome: "Alongamento de Coluna",
    descricao: "Sente-se e toque os pés com as mãos, mantendo por 20-30 segundos.",
    duracao: "4 min",
    emoji: "🔄",
    youtube: "https://www.youtube.com/results?search_query=alongamento+coluna",
    beneficio: "Melhora postura e flexibilidade"
  },
  {
    id: 4,
    nome: "Alongamento de Pulsos",
    descricao: "Estenda o braço e puxe os dedos para trás. Mantenha 15 segundos cada lado.",
    duracao: "2 min",
    emoji: "✋",
    youtube: "https://www.youtube.com/results?search_query=alongamento+pulsos",
    beneficio: "Previne lesões por repetição"
  },
  {
    id: 5,
    nome: "Alongamento de Pernas",
    descricao: "Sente-se e estenda uma perna, tocando o pé. Mantenha 20 segundos cada lado.",
    duracao: "5 min",
    emoji: "🦵",
    youtube: "https://www.youtube.com/results?search_query=alongamento+pernas",
    beneficio: "Melhora circulação"
  },
  {
    id: 6,
    nome: "Alongamento de Quadril",
    descricao: "Sente-se com uma perna cruzada e incline o corpo para frente. Mantenha 20 segundos.",
    duracao: "3 min",
    emoji: "🪑",
    youtube: "https://www.youtube.com/results?search_query=alongamento+quadril",
    beneficio: "Alivia tensão do quadril"
  },
];

const posturas = [
  {
    id: 1,
    titulo: "Postura Sentada Correta",
    descricao: "Coluna reta, pés apoiados, cotovelos em 90°, tela ao nível dos olhos",
    emoji: "💺",
    dicas: ["Cadeira com suporte lombar", "Pés no chão", "Tela a 50-70cm"]
  },
  {
    id: 2,
    titulo: "Postura em Pé",
    descricao: "Ombros relaxados, coluna reta, peso distribuído nos dois pés",
    emoji: "🧍",
    dicas: ["Não cruze as pernas", "Relaxe os ombros", "Abdômen contraído"]
  },
  {
    id: 3,
    titulo: "Postura ao Usar Celular",
    descricao: "Mantenha o celular ao nível dos olhos, não incline o pescoço",
    emoji: "📱",
    dicas: ["Celular na altura dos olhos", "Pescoço reto", "Cotovelos apoiados"]
  },
];

export default function ErgonomiaScreen() {
  const [activeTab, setActiveTab] = useState<"alongamentos" | "posturas" | "respiracao">("alongamentos");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleOpenYoutube = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Erro ao abrir YouTube:", error);
    }
  };

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧘 Ergonomia</Text>
          <Text style={styles.subtitle}>Alongamentos, posturas e técnicas de respiração</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "alongamentos" && styles.tabActive]}
            onPress={() => setActiveTab("alongamentos")}
          >
            <Text style={[styles.tabLabel, activeTab === "alongamentos" && styles.tabLabelActive]}>
              Alongamentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "posturas" && styles.tabActive]}
            onPress={() => setActiveTab("posturas")}
          >
            <Text style={[styles.tabLabel, activeTab === "posturas" && styles.tabLabelActive]}>
              Posturas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "respiracao" && styles.tabActive]}
            onPress={() => setActiveTab("respiracao")}
          >
            <Text style={[styles.tabLabel, activeTab === "respiracao" && styles.tabLabelActive]}>
              Respiração
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "alongamentos" && (
            <View style={styles.section}>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 Faça alongamentos a cada 1 hora de trabalho</Text>
              </View>

              {alongamentos.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.expandableCard, expandedId === item.id && styles.expandedCard]}
                  onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.emoji}>{item.emoji}</Text>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.nome}</Text>
                        <Text style={styles.cardDuration}>⏱️ {item.duracao}</Text>
                      </View>
                    </View>
                    <Text style={styles.expandIcon}>{expandedId === item.id ? "▼" : "▶"}</Text>
                  </View>

                  {expandedId === item.id && (
                    <View style={styles.cardContent}>
                      <Text style={styles.cardDescription}>{item.descricao}</Text>
                      <View style={styles.benefitBox}>
                        <Text style={styles.benefitLabel}>✅ Benefício:</Text>
                        <Text style={styles.benefitText}>{item.beneficio}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.youtubeBtn}
                        onPress={() => handleOpenYoutube(item.youtube)}
                      >
                        <Text style={styles.youtubeBtnText}>▶ Ver no YouTube</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === "posturas" && (
            <View style={styles.section}>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 Postura correta previne dores e lesões</Text>
              </View>

              {posturas.map((postura) => (
                <View key={postura.id} style={styles.posturaCard}>
                  <View style={styles.posturaHeader}>
                    <Text style={styles.posturaEmoji}>{postura.emoji}</Text>
                    <View style={styles.posturaInfo}>
                      <Text style={styles.posturaTitle}>{postura.titulo}</Text>
                      <Text style={styles.posturaDesc}>{postura.descricao}</Text>
                    </View>
                  </View>

                  <View style={styles.posturaDetails}>
                    <Text style={styles.detailsLabel}>Dicas:</Text>
                    {postura.dicas.map((dica, idx) => (
                      <Text key={idx} style={styles.detailsItem}>
                        • {dica}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "respiracao" && (
            <View style={styles.section}>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 Respiração 4-7-8 reduz estresse e ansiedade</Text>
              </View>

              <RespirationGuide />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function RespirationGuide() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"ready" | "inhale" | "hold" | "exhale">("ready");
  const [count, setCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === "ready") {
      timer = setTimeout(() => {
        setPhase("inhale");
        setCount(0);
      }, 1000);
    } else if (phase === "inhale") {
      if (count < 4) {
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        timer = setTimeout(() => setCount(count + 1), 1000);
      } else {
        setPhase("hold");
        setCount(0);
      }
    } else if (phase === "hold") {
      if (count < 7) {
        timer = setTimeout(() => setCount(count + 1), 1000);
      } else {
        setPhase("exhale");
        setCount(0);
      }
    } else if (phase === "exhale") {
      if (count < 8) {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        timer = setTimeout(() => setCount(count + 1), 1000);
      } else {
        setPhase("inhale");
        setCount(0);
      }
    }

    return () => clearTimeout(timer);
  }, [isActive, phase, count, scaleAnim]);

  const phaseText = {
    ready: "Prepare-se...",
    inhale: `Inspire (${count + 1}/4)`,
    hold: `Segure (${count + 1}/7)`,
    exhale: `Expire (${count + 1}/8)`,
  };

  return (
    <View style={styles.respirationContainer}>
      <View style={styles.respirationCard}>
        <Text style={styles.respirationTitle}>Técnica 4-7-8</Text>
        <Text style={styles.respirationSubtitle}>Inspire por 4, segure por 7, expire por 8</Text>

        <Animated.View
          style={[
            styles.respirationCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.respirationPhase}>{phaseText[phase]}</Text>
        </Animated.View>

        <TouchableOpacity
          style={[styles.respirationBtn, isActive && styles.respirationBtnActive]}
          onPress={() => {
            setIsActive(!isActive);
            if (!isActive) {
              setPhase("ready");
              setCount(0);
            }
          }}
        >
          <Text style={styles.respirationBtnText}>
            {isActive ? "⏸ Pausar" : "▶ Começar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.respirationSteps}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Inspire lentamente por 4 segundos</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Segure a respiração por 7 segundos</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Expire lentamente por 8 segundos</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Repita 4 vezes</Text>
          </View>
        </View>
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
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#1B8A4C",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    gap: 12,
  },
  tipBox: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  expandableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  expandedCard: {
    borderColor: "#1B8A4C",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  cardDuration: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 14,
    color: "#1B8A4C",
  },
  cardContent: {
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cardDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  benefitBox: {
    backgroundColor: "#E8F5EE",
    borderRadius: 8,
    padding: 8,
  },
  benefitLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B8A4C",
  },
  benefitText: {
    fontSize: 12,
    color: "#1B8A4C",
    marginTop: 2,
  },
  youtubeBtn: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  youtubeBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  posturaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 12,
  },
  posturaHeader: {
    flexDirection: "row",
    gap: 12,
  },
  posturaEmoji: {
    fontSize: 32,
  },
  posturaInfo: {
    flex: 1,
  },
  posturaTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 2,
  },
  posturaDesc: {
    fontSize: 12,
    color: "#666",
  },
  posturaDetails: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 8,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B8A4C",
    marginBottom: 4,
  },
  detailsItem: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  respirationContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  respirationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  respirationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  respirationSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  respirationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E8F5EE",
    borderWidth: 2,
    borderColor: "#1B8A4C",
    justifyContent: "center",
    alignItems: "center",
  },
  respirationPhase: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
    textAlign: "center",
  },
  respirationBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  respirationBtnActive: {
    backgroundColor: "#27AE60",
  },
  respirationBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  respirationSteps: {
    width: "100%",
    gap: 8,
  },
  step: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1B8A4C",
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
    fontSize: 12,
  },
  stepText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    paddingTop: 4,
  },
});
