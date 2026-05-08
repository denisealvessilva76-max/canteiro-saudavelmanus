import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const ADMIN_CREDENTIALS = {
  email: "admin@canteiro.com",
  password: "admin123",
};

export default function AdminPanelScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "funcionarios" | "desafios" | "comunicados">("dashboard");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdminLogin();
  }, []);

  const checkAdminLogin = async () => {
    try {
      const adminToken = await AsyncStorage.getItem("admin:token");
      if (adminToken) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Erro ao verificar login:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      Alert.alert("Erro", "Email ou senha incorretos");
      return;
    }

    setLoading(true);

    try {
      await AsyncStorage.setItem("admin:token", "admin_token_" + Date.now());
      setIsLoggedIn(true);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("admin:token");
      setIsLoggedIn(false);
      setEmail("");
      setPassword("");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer logout");
    }
  };

  if (!isLoggedIn) {
    return (
      <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>🔐 Painel Administrativo</Text>
            <Text style={styles.loginSubtitle}>Acesso Restrito</Text>

            <View style={styles.loginForm}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.input}>
                  <Text style={styles.inputText}>admin@canteiro.com</Text>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Senha</Text>
                <View style={styles.input}>
                  <Text style={styles.inputText}>••••••••</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.credentialsInfo}>
              <Text style={styles.credentialsTitle}>Credenciais de Teste:</Text>
              <Text style={styles.credentialsText}>📧 admin@canteiro.com</Text>
              <Text style={styles.credentialsText}>🔑 admin123</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Painel Administrativo</Text>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Text style={styles.logoutBtnText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["dashboard", "funcionarios", "desafios", "comunicados"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === "dashboard" && "📈"}
                {tab === "funcionarios" && "👥"}
                {tab === "desafios" && "🎯"}
                {tab === "comunicados" && "📢"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <View style={styles.content}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <StatCard icon="👥" label="Funcionários" value="24" color="#1B8A4C" />
              <StatCard icon="✓" label="Ativos Hoje" value="18" color="#27AE60" />
              <StatCard icon="💧" label="Hidratação" value="2.5L" color="#4ECDC4" />
              <StatCard icon="⚠️" label="Queixas" value="5" color="#FF6B6B" />
            </View>

            {/* Gráficos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Evolução Mensal</Text>
              
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>💧 Hidratação</Text>
                <View style={styles.chartBars}>
                  <ChartBar label="Seg" value={75} />
                  <ChartBar label="Ter" value={82} />
                  <ChartBar label="Qua" value={68} />
                  <ChartBar label="Qui" value={90} />
                  <ChartBar label="Sex" value={85} />
                </View>
                <Text style={styles.chartAverage}>Média: 80% da meta</Text>
              </View>

              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>❤️ Pressão Arterial</Text>
                <View style={styles.chartBars}>
                  <ChartBar label="Seg" value={65} color="#FF6B6B" />
                  <ChartBar label="Ter" value={72} color="#FF6B6B" />
                  <ChartBar label="Qua" value={58} color="#4ECDC4" />
                  <ChartBar label="Qui" value={75} color="#FF6B6B" />
                  <ChartBar label="Sex" value={68} color="#FF6B6B" />
                </View>
                <Text style={styles.chartAverage}>Média: 67.6 mmHg</Text>
              </View>

              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>⭐ Pontos Acumulados</Text>
                <View style={styles.chartBars}>
                  <ChartBar label="Seg" value={45} color="#FFD700" />
                  <ChartBar label="Ter" value={62} color="#FFD700" />
                  <ChartBar label="Qua" value={58} color="#FFD700" />
                  <ChartBar label="Qui" value={78} color="#FFD700" />
                  <ChartBar label="Sex" value={85} color="#FFD700" />
                </View>
                <Text style={styles.chartAverage}>Total: 328 pontos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Funcionários Tab */}
        {activeTab === "funcionarios" && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>👥 Funcionários Cadastrados</Text>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <Text style={styles.employeeAvatar}>👤</Text>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>Funcionário {i}</Text>
                    <Text style={styles.employeeRole}>Cargo - Turno Matutino</Text>
                  </View>
                </View>
                <View style={styles.employeeStats}>
                  <View style={styles.employeeStat}>
                    <Text style={styles.employeeStatLabel}>Hidratação</Text>
                    <Text style={styles.employeeStatValue}>2.5L</Text>
                  </View>
                  <View style={styles.employeeStat}>
                    <Text style={styles.employeeStatLabel}>Pressão</Text>
                    <Text style={styles.employeeStatValue}>120/80</Text>
                  </View>
                  <View style={styles.employeeStat}>
                    <Text style={styles.employeeStatLabel}>Pontos</Text>
                    <Text style={styles.employeeStatValue}>250</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Desafios Tab */}
        {activeTab === "desafios" && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>🎯 Desafios Ativos</Text>
            {[
              { title: "Hidratação Diária", participants: 18, progress: 75 },
              { title: "Atividade Física", participants: 12, progress: 60 },
              { title: "Alimentação Saudável", participants: 15, progress: 55 },
            ].map((challenge, i) => (
              <View key={i} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>{challenge.participants} participantes</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{challenge.progress}% completo</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>📋 Submissões Pendentes</Text>
            {[
              { name: "João Silva", challenge: "Hidratação", difficulty: "Esqueci de beber água", status: "pending", photos: 2 },
              { name: "Maria Santos", challenge: "Atividade Física", difficulty: "Cansaço no fim do dia", status: "pending", photos: 1 },
            ].map((submission, i) => (
              <View key={i} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <View>
                    <Text style={styles.submissionName}>{submission.name}</Text>
                    <Text style={styles.submissionChallenge}>{submission.challenge}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Pendente</Text>
                  </View>
                </View>
                <View style={styles.submissionContent}>
                  <Text style={styles.difficultyLabel}>Dificuldade:</Text>
                  <Text style={styles.difficultyText}>{submission.difficulty}</Text>
                  <Text style={styles.photoCount}>📸 {submission.photos} foto{submission.photos > 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.submissionActions}>
                  <TouchableOpacity style={styles.approveBtn}>
                    <Text style={styles.approveBtnText}>✓ Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <Text style={styles.rejectBtnText}>✕ Rejeitar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Comunicados Tab */}
        {activeTab === "comunicados" && (
          <View style={styles.content}>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Novo Comunicado</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>📢 Comunicados Recentes</Text>
            {[
              { title: "Desafio da Semana", category: "Desafio", date: "Hoje" },
              { title: "Manutenção do Sistema", category: "Urgente", date: "Ontem" },
              { title: "Resultado da Pesagem", category: "Informativo", date: "2 dias atrás" },
            ].map((comm, i) => (
              <View key={i} style={styles.communicadoCard}>
                <View style={styles.communicadoHeader}>
                  <Text style={styles.communicadoTitle}>{comm.title}</Text>
                  <View style={[styles.badge, comm.category === "Urgente" && styles.badgeUrgent]}>
                    <Text style={styles.badgeText}>{comm.category}</Text>
                  </View>
                </View>
                <Text style={styles.communicadoDate}>{comm.date}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

function ChartBar({ label, value, color = "#1B8A4C" }: any) {
  return (
    <View style={styles.chartBarContainer}>
      <View style={[styles.chartBarFill, { height: `${value}%`, backgroundColor: color }]} />
      <Text style={styles.chartBarLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B8A4C",
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loginForm: {
    width: "100%",
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  input: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 14,
    color: "#999",
  },
  loginBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  credentialsInfo: {
    backgroundColor: "#E8F5EE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    padding: 16,
    gap: 8,
  },
  credentialsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  credentialsText: {
    fontSize: 12,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  logoutBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 28,
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    gap: 8,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  chartBarFill: {
    width: "100%",
    borderRadius: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: "#666",
  },
  chartAverage: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  employeeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 12,
  },
  employeeHeader: {
    flexDirection: "row",
    gap: 12,
  },
  employeeAvatar: {
    fontSize: 32,
  },
  employeeInfo: {
    flex: 1,
    gap: 2,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  employeeRole: {
    fontSize: 12,
    color: "#666",
  },
  employeeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  employeeStat: {
    alignItems: "center",
    gap: 2,
  },
  employeeStatLabel: {
    fontSize: 10,
    color: "#666",
  },
  employeeStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  addBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  challengeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  challengeHeader: {
    gap: 4,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  challengeParticipants: {
    fontSize: 12,
    color: "#666",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1B8A4C",
  },
  progressText: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },
  communicadoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  communicadoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  communicadoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
    flex: 1,
  },
  badge: {
    backgroundColor: "#E8F5EE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeUrgent: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  communicadoDate: {
    fontSize: 11,
    color: "#999",
  },
  submissionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  submissionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  submissionChallenge: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F59E0B",
  },
  submissionContent: {
    gap: 6,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B8A4C",
  },
  difficultyText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  photoCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  submissionActions: {
    flexDirection: "row",
    gap: 8,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  rejectBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
});
