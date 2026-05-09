import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, TextInput, Platform } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";

const CUP_SIZE = 350;

const SYMPTOMS = [
  { id: 1, name: "Dor de cabeça", emoji: "🤕" },
  { id: 2, name: "Dor nas costas", emoji: "🔙" },
  { id: 3, name: "Dor no pescoço", emoji: "🧠" },
  { id: 4, name: "Dor nos ombros", emoji: "💪" },
  { id: 5, name: "Cansaço", emoji: "😴" },
  { id: 6, name: "Estresse", emoji: "😰" },
  { id: 7, name: "Ansiedade", emoji: "😟" },
  { id: 8, name: "Insônia", emoji: "🌙" },
];

export default function SaudeScreen() {
  const [activeTab, setActiveTab] = useState<"hidratacao" | "pressao" | "sintomas">("hidratacao");
  const [profile, setProfile] = useState<any>(null);
  const [todayIntake, setTodayIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [intakeHistory, setIntakeHistory] = useState<any[]>([]);
  const [pressureHistory, setPressureHistory] = useState<any[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [showPressureModal, setShowPressureModal] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileStr = await AsyncStorage.getItem("employee:profile");
      const intakeStr = await AsyncStorage.getItem("today:hydration");
      const historyStr = await AsyncStorage.getItem("hydration:history");
      const pressureStr = await AsyncStorage.getItem("pressure:history");
      const symptomsStr = await AsyncStorage.getItem("today:symptoms");

      if (profileStr) {
        const prof = JSON.parse(profileStr);
        setProfile(prof);
        calculateDailyGoal(prof);
      }

      if (intakeStr) {
        setTodayIntake(parseInt(intakeStr));
      }

      if (historyStr) {
        setIntakeHistory(JSON.parse(historyStr));
      }

      if (pressureStr) {
        setPressureHistory(JSON.parse(pressureStr));
      }

      if (symptomsStr) {
        setSelectedSymptoms(JSON.parse(symptomsStr));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const calculateDailyGoal = (prof: any) => {
    const baseGoal = (prof.peso || 70) * 35;
    const workBonus = prof.tipoTrabalho === "pesado" ? 500 : 0;
    const goal = baseGoal + workBonus;
    setDailyGoal(Math.round(goal));
  };

  const addWater = async () => {
    const newIntake = todayIntake + CUP_SIZE;
    
    try {
      await AsyncStorage.setItem("today:hydration", newIntake.toString());
      
      const newHistory = [
        ...intakeHistory,
        {
          amount: CUP_SIZE,
          time: new Date().toLocaleTimeString("pt-BR"),
          timestamp: new Date().toISOString(),
        },
      ];
      
      await AsyncStorage.setItem("hydration:history", JSON.stringify(newHistory));
      
      setTodayIntake(newIntake);
      setIntakeHistory(newHistory);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (newIntake >= dailyGoal) {
        Alert.alert("🎉 Parabéns!", "Você atingiu sua meta de hidratação do dia!");
      }
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
    }
  };

  const addPressure = async () => {
    if (!systolic || !diastolic) {
      Alert.alert("Erro", "Preencha ambos os valores de pressão");
      return;
    }

    try {
      const newPressure = {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        time: new Date().toLocaleTimeString("pt-BR"),
        timestamp: new Date().toISOString(),
      };

      const newHistory = [...pressureHistory, newPressure];
      await AsyncStorage.setItem("pressure:history", JSON.stringify(newHistory));
      
      setPressureHistory(newHistory);
      setSystolic("");
      setDiastolic("");
      setShowPressureModal(false);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("✅ Registrado", "Pressão arterial registrada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível registrar a pressão");
    }
  };

  const toggleSymptom = async (symptomId: number) => {
    const newSymptoms = selectedSymptoms.includes(symptomId)
      ? selectedSymptoms.filter(id => id !== symptomId)
      : [...selectedSymptoms, symptomId];

    try {
      await AsyncStorage.setItem("today:symptoms", JSON.stringify(newSymptoms));
      setSelectedSymptoms(newSymptoms);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Erro ao salvar sintomas:", error);
    }
  };

  const percentage = Math.min((todayIntake / dailyGoal) * 100, 100);

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>❤️ Saúde</Text>
          <Text style={styles.subtitle}>Hidratação, pressão e sintomas</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "hidratacao" && styles.tabActive]}
            onPress={() => setActiveTab("hidratacao")}
          >
            <Text style={[styles.tabLabel, activeTab === "hidratacao" && styles.tabLabelActive]}>
              💧 Hidratação
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "pressao" && styles.tabActive]}
            onPress={() => setActiveTab("pressao")}
          >
            <Text style={[styles.tabLabel, activeTab === "pressao" && styles.tabLabelActive]}>
              🫀 Pressão
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "sintomas" && styles.tabActive]}
            onPress={() => setActiveTab("sintomas")}
          >
            <Text style={[styles.tabLabel, activeTab === "sintomas" && styles.tabLabelActive]}>
              🤒 Sintomas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "hidratacao" && (
            <View style={styles.section}>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 Meta diária: {dailyGoal}ml</Text>
              </View>

              {/* Garrafa Visual */}
              <View style={styles.bottleContainer}>
                <View style={styles.bottle}>
                  <View style={styles.bottleTop} />
                  <View
                    style={[
                      styles.bottleWater,
                      { height: `${percentage}%` }
                    ]}
                  />
                  <View style={styles.bottlePercentage}>
                    <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.intakeInfo}>
                <Text style={styles.intakeValue}>{todayIntake}ml</Text>
                <Text style={styles.intakeLabel}>de {dailyGoal}ml</Text>
                <Text style={styles.intakeRemaining}>
                  Faltam {Math.max(0, dailyGoal - todayIntake)}ml
                </Text>
              </View>

              {/* Copos */}
              <View style={styles.cupsContainer}>
                <Text style={styles.cupsLabel}>Copos (350ml)</Text>
                <View style={styles.cupsGrid}>
                  {[...Array(Math.ceil(dailyGoal / CUP_SIZE))].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.cup,
                        i < todayIntake / CUP_SIZE && styles.cupFilled
                      ]}
                      onPress={addWater}
                    >
                      <Text style={styles.cupEmoji}>
                        {i < todayIntake / CUP_SIZE ? "💧" : "🥤"}
                      </Text>
                      <Text style={styles.cupLabel}>{(i + 1) * CUP_SIZE}ml</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.addBtn} onPress={addWater}>
                <Text style={styles.addBtnText}>+ Adicionar Copo (350ml)</Text>
              </TouchableOpacity>

              {/* Cor da Urina */}
              <View style={styles.urineTipsContainer}>
                <Text style={styles.tipsTitle}>Cor da Urina</Text>
                <View style={styles.urineTip}>
                  <Text style={styles.urineDot}>🟡</Text>
                  <Text style={styles.urineTipText}>Amarelo claro = Bem hidratado</Text>
                </View>
                <View style={styles.urineTip}>
                  <Text style={styles.urineDot}>🟠</Text>
                  <Text style={styles.urineTipText}>Amarelo escuro = Beba mais água</Text>
                </View>
                <View style={styles.urineTip}>
                  <Text style={styles.urineDot}>🔴</Text>
                  <Text style={styles.urineTipText}>Marrom = Hidratação crítica</Text>
                </View>
              </View>

              {/* Histórico */}
              {intakeHistory.length > 0 && (
                <View style={styles.historyContainer}>
                  <Text style={styles.historyTitle}>Histórico de Hoje</Text>
                  {intakeHistory.map((entry, i) => (
                    <View key={i} style={styles.historyItem}>
                      <Text style={styles.historyAmount}>💧 {entry.amount}ml</Text>
                      <Text style={styles.historyTime}>{entry.time}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "pressao" && (
            <View style={styles.section}>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 Pressão normal: 120/80 mmHg</Text>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowPressureModal(true)}
              >
                <Text style={styles.addBtnText}>+ Registrar Pressão</Text>
              </TouchableOpacity>

              {/* Modal de Pressão */}
              <Modal visible={showPressureModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Registrar Pressão Arterial</Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Sistólica (mmHg)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ex: 120"
                        keyboardType="numeric"
                        value={systolic}
                        onChangeText={setSystolic}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Diastólica (mmHg)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ex: 80"
                        keyboardType="numeric"
                        value={diastolic}
                        onChangeText={setDiastolic}
                      />
                    </View>

                    <TouchableOpacity style={styles.modalBtn} onPress={addPressure}>
                      <Text style={styles.modalBtnText}>Salvar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnCancel]}
                      onPress={() => setShowPressureModal(false)}
                    >
                      <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Histórico de Pressão */}
              {pressureHistory.length > 0 && (
                <View style={styles.historyContainer}>
                  <Text style={styles.historyTitle}>Histórico</Text>
                  {pressureHistory.map((entry, i) => (
                    <View key={i} style={styles.pressureHistoryItem}>
                      <View>
                        <Text style={styles.pressureValue}>
                          {entry.systolic}/{entry.diastolic} mmHg
                        </Text>
                        <Text style={styles.pressureStatus}>
                          {entry.systolic < 120 && entry.diastolic < 80
                            ? "✅ Normal"
                            : entry.systolic < 130 && entry.diastolic < 80
                            ? "⚠️ Elevada"
                            : "🔴 Alta"}
                        </Text>
                      </View>
                      <Text style={styles.historyTime}>{entry.time}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "sintomas" && (
            <View style={styles.section}>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 Selecione os sintomas que você sente</Text>
              </View>

              <View style={styles.symptomsGrid}>
                {SYMPTOMS.map((symptom) => (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[
                      styles.symptomCard,
                      selectedSymptoms.includes(symptom.id) && styles.symptomCardSelected
                    ]}
                    onPress={() => toggleSymptom(symptom.id)}
                  >
                    <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                    <Text style={styles.symptomName}>{symptom.name}</Text>
                    {selectedSymptoms.includes(symptom.id) && (
                      <Text style={styles.symptomCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {selectedSymptoms.length > 0 && (
                <View style={styles.selectedSymptomsContainer}>
                  <Text style={styles.selectedSymptomsTitle}>
                    {selectedSymptoms.length} sintoma(s) selecionado(s)
                  </Text>
                  <View style={styles.selectedSymptomsList}>
                    {selectedSymptoms.map((id) => {
                      const symptom = SYMPTOMS.find(s => s.id === id);
                      return (
                        <View key={id} style={styles.selectedSymptomItem}>
                          <Text>{symptom?.emoji} {symptom?.name}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
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
  bottleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  bottle: {
    width: 80,
    height: 160,
    borderWidth: 2,
    borderColor: "#1B8A4C",
    borderRadius: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: "#F0F8F5",
    overflow: "hidden",
    position: "relative",
  },
  bottleTop: {
    height: 12,
    backgroundColor: "#1B8A4C",
    borderBottomWidth: 1,
    borderBottomColor: "#0F5A38",
  },
  bottleWater: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#3498DB",
    opacity: 0.7,
  },
  bottlePercentage: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  intakeInfo: {
    alignItems: "center",
    gap: 4,
  },
  intakeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  intakeLabel: {
    fontSize: 13,
    color: "#666",
  },
  intakeRemaining: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  cupsContainer: {
    gap: 8,
  },
  cupsLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  cupsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cup: {
    width: "31%",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  cupFilled: {
    backgroundColor: "#D4EDDA",
    borderColor: "#1B8A4C",
  },
  cupEmoji: {
    fontSize: 24,
  },
  cupLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
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
  urineTipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 4,
  },
  urineTip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urineDot: {
    fontSize: 16,
  },
  urineTipText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  historyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
    marginBottom: 4,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1B8A4C",
  },
  historyTime: {
    fontSize: 12,
    color: "#999",
  },
  pressureHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pressureValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  pressureStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  modalBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  modalBtnCancel: {
    backgroundColor: "#F0F0F0",
  },
  modalBtnCancelText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 14,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomCard: {
    width: "48%",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  symptomCardSelected: {
    backgroundColor: "#D4EDDA",
    borderColor: "#1B8A4C",
  },
  symptomEmoji: {
    fontSize: 28,
  },
  symptomName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  symptomCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#1B8A4C",
    color: "#FFFFFF",
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
    fontWeight: "700",
  },
  selectedSymptomsContainer: {
    backgroundColor: "#E8F5EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    padding: 12,
    gap: 8,
  },
  selectedSymptomsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  selectedSymptomsList: {
    gap: 6,
  },
  selectedSymptomItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#666",
  },
});
