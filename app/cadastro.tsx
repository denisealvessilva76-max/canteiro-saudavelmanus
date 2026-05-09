import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function CadastroScreen() {
  const router = useRouter();
  const colors = useColors();
  const [step, setStep] = useState(1);

  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [customFuncao, setCustomFuncao] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [tipoTrabalho, setTipoTrabalho] = useState<"leve" | "moderado" | "pesado">("moderado");
  const [comorbidades, setComorbidades] = useState<string[]>([]);

  const funcoes = ["Gerente", "Técnico", "Operário", "Administrativo", "Outro"];
  const comorbidasList = ["Pressão Alta", "Diabetes", "Hipertensão", "Glicemia Alta", "Nenhuma"];

  const toggleComorbidade = (item: string) => {
    if (comorbidades.includes(item)) {
      setComorbidades(comorbidades.filter((c) => c !== item));
    } else {
      setComorbidades([...comorbidades, item]);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!matricula || !nome || !funcao) {
        Alert.alert("Erro", "Preencha todos os campos obrigatórios");
        return;
      }
      if (funcao === "Outro" && !customFuncao) {
        Alert.alert("Erro", "Especifique sua função");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!peso || !altura) {
        Alert.alert("Erro", "Preencha peso e altura");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await saveCadastro();
    }
  };

  const saveCadastro = async () => {
    try {
      const profileData = {
        matricula,
        nome,
        funcao: funcao === "Outro" ? customFuncao : funcao,
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        tipoTrabalho,
        comorbidades: comorbidades.filter((c) => c !== "Nenhuma"),
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("employee:matricula", matricula);
      await AsyncStorage.setItem("employee:profile", JSON.stringify(profileData));

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.replace("/tutorial");
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
      Alert.alert("Erro", "Não foi possível salvar o cadastro");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Cadastro</Text>
            <Text className="text-sm text-muted mt-2">Passo {step} de 3</Text>
          </View>

          {step === 1 && (
            <View className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Matrícula *</Text>
                <TextInput
                  placeholder="Ex: 12345"
                  value={matricula}
                  onChangeText={setMatricula}
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Nome Completo *</Text>
                <TextInput
                  placeholder="Seu nome"
                  value={nome}
                  onChangeText={setNome}
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Função *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  {funcoes.map((f) => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => {
                        setFuncao(f);
                        if (f !== "Outro") setCustomFuncao("");
                      }}
                      className={`px-4 py-2 rounded-full border-2 ${
                        funcao === f
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          funcao === f ? "text-white" : "text-foreground"
                        }`}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {funcao === "Outro" && (
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Especifique sua função</Text>
                  <TextInput
                    placeholder="Sua função"
                    value={customFuncao}
                    onChangeText={setCustomFuncao}
                    className="border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              )}
            </View>
          )}

          {step === 2 && (
            <View className="gap-4">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground mb-2">Peso (kg) *</Text>
                  <TextInput
                    placeholder="Ex: 75"
                    value={peso}
                    onChangeText={setPeso}
                    className="border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground mb-2">Altura (cm) *</Text>
                  <TextInput
                    placeholder="Ex: 175"
                    value={altura}
                    onChangeText={setAltura}
                    className="border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Tipo de Trabalho</Text>
                <View className="gap-2">
                  {(["leve", "moderado", "pesado"] as const).map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      onPress={() => setTipoTrabalho(tipo)}
                      className={`p-3 rounded-lg border-2 ${
                        tipoTrabalho === tipo
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`font-semibold capitalize ${
                          tipoTrabalho === tipo ? "text-white" : "text-foreground"
                        }`}
                      >
                        {tipo === "leve" ? "Leve (Escritório)" : tipo === "moderado" ? "Moderado" : "Pesado (Campo)"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Comorbidades</Text>
                <View className="gap-2">
                  {comorbidasList.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => toggleComorbidade(item)}
                      className={`p-3 rounded-lg border-2 flex-row items-center ${
                        comorbidades.includes(item)
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`flex-1 font-semibold ${
                          comorbidades.includes(item) ? "text-white" : "text-foreground"
                        }`}
                      >
                        {item}
                      </Text>
                      {comorbidades.includes(item) && (
                        <Text className="text-white text-lg">✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View className="gap-4">
              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <ConfirmRow label="Matrícula" value={matricula} />
                <ConfirmRow label="Nome" value={nome} />
                <ConfirmRow label="Função" value={funcao === "Outro" ? customFuncao : funcao} />
                <ConfirmRow label="Peso" value={`${peso} kg`} />
                <ConfirmRow label="Altura" value={`${altura} cm`} />
                <ConfirmRow label="Trabalho" value={tipoTrabalho} />
              </View>
            </View>
          )}

          <View className="gap-3 mt-auto">
            {step > 1 && (
              <TouchableOpacity
                onPress={() => setStep(step - 1)}
                className="border-2 border-primary rounded-lg py-3 items-center"
              >
                <Text className="text-primary font-bold">Voltar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              className="bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-white font-bold">
                {step === 3 ? "Confirmar" : "Próximo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-border">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
