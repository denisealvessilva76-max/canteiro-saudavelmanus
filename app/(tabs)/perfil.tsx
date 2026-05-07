import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const AVATARS = ["👨‍💼", "👩‍💼", "👨‍🔬", "👩‍🔬", "👨‍⚕️", "👩‍⚕️", "👨‍🍳", "👩‍🍳"];

export default function PerfilScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileStr = await AsyncStorage.getItem("employee:profile");
      const pointsStr = await AsyncStorage.getItem("user:points");
      const sequenceStr = await AsyncStorage.getItem("user:sequence");

      if (profileStr) {
        const prof = JSON.parse(profileStr);
        setProfile(prof);
        setEditData(prof);
      }

      if (pointsStr) {
        const pts = parseInt(pointsStr);
        setPoints(pts);
        setLevel(Math.floor(pts / 100) + 1);
      }

      if (sequenceStr) {
        setSequence(parseInt(sequenceStr));
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem("employee:profile", JSON.stringify(editData));
      setProfile(editData);
      setShowEditModal(false);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("✅ Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o perfil");
    }
  };

  const selectAvatar = async (avatar: string) => {
    try {
      const updated = { ...editData, avatar };
      setEditData(updated);
      await AsyncStorage.setItem("employee:profile", JSON.stringify(updated));
      setProfile(updated);
      setShowAvatarModal(false);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Tem certeza que deseja sair?", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Sair",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("USER_INFO_KEY");
            await AsyncStorage.removeItem("employee:profile");
            await AsyncStorage.removeItem("employee:matricula");
            router.replace("/login");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível fazer logout");
          }
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-white" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>👤 Perfil</Text>
          <Text style={styles.subtitle}>Seus dados e histórico</Text>
        </View>

        {/* Avatar e Nome */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
          >
            <Text style={styles.avatar}>{profile.avatar || "👨‍💼"}</Text>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.nome || "Usuário"}</Text>
            <Text style={styles.profileMatricula}>Matrícula: {profile.matricula}</Text>
            <Text style={styles.profileCargo}>{profile.cargo || "Cargo não informado"}</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Nível</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sequence}</Text>
            <Text style={styles.statLabel}>Sequência</Text>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Dados Pessoais</Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <Text style={styles.editBtn}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataContainer}>
            <DataRow label="Nome" value={profile.nome} />
            <DataRow label="Matrícula" value={profile.matricula} />
            <DataRow label="Cargo" value={profile.cargo} />
            <DataRow label="Peso" value={`${profile.peso} kg`} />
            <DataRow label="Altura" value={`${profile.altura} cm`} />
            <DataRow label="Turno" value={profile.tipoTrabalho || "Não informado"} />
          </View>
        </View>

        {/* Progresso */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Progresso</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((points % 100) / 100) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {points % 100}/100 pontos para próximo nível
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>🚪 Fazer Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Edição */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <EditField
                  label="Nome"
                  value={editData.nome}
                  onChangeText={(text) => setEditData({ ...editData, nome: text })}
                />

                <EditField
                  label="Cargo"
                  value={editData.cargo}
                  onChangeText={(text) => setEditData({ ...editData, cargo: text })}
                />

                <EditField
                  label="Peso (kg)"
                  value={editData.peso?.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    setEditData({ ...editData, peso: parseInt(text) || 0 })
                  }
                />

                <EditField
                  label="Altura (cm)"
                  value={editData.altura?.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    setEditData({ ...editData, altura: parseInt(text) || 0 })
                  }
                />

                <View style={styles.editFieldContainer}>
                  <Text style={styles.editFieldLabel}>Tipo de Trabalho</Text>
                  <View style={styles.workTypeContainer}>
                    {["leve", "moderado", "pesado"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.workTypeBtn,
                          editData.tipoTrabalho === type && styles.workTypeBtnActive,
                        ]}
                        onPress={() => setEditData({ ...editData, tipoTrabalho: type })}
                      >
                        <Text
                          style={[
                            styles.workTypeLabel,
                            editData.tipoTrabalho === type && styles.workTypeLabelActive,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtn} onPress={saveProfile}>
                <Text style={styles.modalBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Avatar */}
      <Modal visible={showAvatarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.avatarModalContent}>
            <Text style={styles.avatarModalTitle}>Escolha seu Avatar</Text>

            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.avatarOption,
                    profile.avatar === avatar && styles.avatarOptionSelected,
                  ]}
                  onPress={() => selectAvatar(avatar)}
                >
                  <Text style={styles.avatarOptionEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.avatarModalCloseBtn}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.avatarModalCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function EditField({
  label,
  value,
  keyboardType = "default",
  onChangeText,
}: {
  label: string;
  value?: string;
  keyboardType?: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.editFieldContainer}>
      <Text style={styles.editFieldLabel}>{label}</Text>
      <TextInput
        style={styles.editFieldInput}
        placeholder={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
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
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1B8A4C",
  },
  avatar: {
    fontSize: 40,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1B8A4C",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  profileMatricula: {
    fontSize: 12,
    color: "#666",
  },
  profileCargo: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  statsContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#E8F5EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1B8A4C",
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  editBtn: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B8A4C",
    backgroundColor: "#E8F5EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dataContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dataLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  dataValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1B8A4C",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
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
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
  },
  modalCloseBtn: {
    fontSize: 24,
    color: "#999",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  editFieldContainer: {
    gap: 6,
  },
  editFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  editFieldInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  workTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  workTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  workTypeBtnActive: {
    backgroundColor: "#1B8A4C",
    borderColor: "#1B8A4C",
  },
  workTypeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  workTypeLabelActive: {
    color: "#FFFFFF",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
  avatarModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  avatarModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B8A4C",
    textAlign: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  avatarOption: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    backgroundColor: "#E8F5EE",
    borderColor: "#1B8A4C",
  },
  avatarOptionEmoji: {
    fontSize: 32,
  },
  avatarModalCloseBtn: {
    backgroundColor: "#1B8A4C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  avatarModalCloseBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
