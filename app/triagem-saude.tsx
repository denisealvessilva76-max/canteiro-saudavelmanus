import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFirebaseSync } from '../hooks/use-firebase-sync';

const { width } = Dimensions.get('window');

interface HealthMeasurement {
  date: string;
  timestamp: number;
  weight?: number;
  height?: number;
  imc?: number;
  glucose?: number;
  systolic?: number;
  diastolic?: number;
  notes?: string;
}

interface RiskLevel {
  level: 'normal' | 'warning' | 'alert';
  message: string;
  color: string;
}

export default function TriagemSaudeScreen() {
  const router = useRouter();
  const [matricula, setMatricula] = useState<string | null>(null);
  const { syncProfile } = useFirebaseSync({ matricula: matricula || '', enabled: !!matricula });

  useEffect(() => {
    loadMatricula();
  }, []);

  const loadMatricula = async () => {
    const mat = await AsyncStorage.getItem('employee:matricula');
    setMatricula(mat);
  };

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [glucose, setGlucose] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const stored = await AsyncStorage.getItem('health:measurements');
      if (stored) {
        setMeasurements(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar medições:', error);
    }
  };

  const calculateIMC = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const getIMCRisk = (imc: number): RiskLevel => {
    if (imc < 18.5) {
      return { level: 'warning', message: 'Abaixo do peso', color: '#FFB800' };
    } else if (imc >= 18.5 && imc < 25) {
      return { level: 'normal', message: 'Peso normal', color: '#00A86B' };
    } else if (imc >= 25 && imc < 30) {
      return { level: 'warning', message: 'Sobrepeso', color: '#FFB800' };
    } else {
      return { level: 'alert', message: 'Obesidade', color: '#FF6B6B' };
    }
  };

  const getGlucoseRisk = (glucose: number): RiskLevel => {
    if (glucose < 70) {
      return { level: 'alert', message: 'Hipoglicemia - Procure ajuda', color: '#FF6B6B' };
    } else if (glucose >= 70 && glucose < 100) {
      return { level: 'normal', message: 'Glicemia normal (em jejum)', color: '#00A86B' };
    } else if (glucose >= 100 && glucose < 126) {
      return { level: 'warning', message: 'Glicemia elevada (em jejum)', color: '#FFB800' };
    } else {
      return { level: 'alert', message: 'Alerta de Diabetes - Procure médico', color: '#FF6B6B' };
    }
  };

  const getPressureRisk = (systolic: number, diastolic: number): RiskLevel => {
    if (systolic < 90 || diastolic < 60) {
      return { level: 'warning', message: 'Pressão baixa', color: '#FFB800' };
    } else if (systolic >= 90 && systolic < 120 && diastolic >= 60 && diastolic < 80) {
      return { level: 'normal', message: 'Pressão normal', color: '#00A86B' };
    } else if (systolic >= 120 && systolic < 140 && diastolic >= 80 && diastolic < 90) {
      return { level: 'warning', message: 'Pressão elevada', color: '#FFB800' };
    } else {
      return { level: 'alert', message: 'Hipertensão - Procure médico', color: '#FF6B6B' };
    }
  };

  const handleSaveMeasurement = async () => {
    try {
      if (!weight || !height) {
        Alert.alert('Erro', 'Por favor, preencha peso e altura');
        return;
      }

      setLoading(true);

      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const glucoseNum = glucose ? parseFloat(glucose) : undefined;
      const systolicNum = systolic ? parseFloat(systolic) : undefined;
      const diastolicNum = diastolic ? parseFloat(diastolic) : undefined;

      const imc = calculateIMC(weightNum, heightNum);

      const measurement: HealthMeasurement = {
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        weight: weightNum,
        height: heightNum,
        imc,
        glucose: glucoseNum,
        systolic: systolicNum,
        diastolic: diastolicNum,
        notes: notes || undefined,
      };

      const updated = [measurement, ...measurements].slice(0, 30); // Manter últimas 30 medições
      await AsyncStorage.setItem('health:measurements', JSON.stringify(updated));
      setMeasurements(updated);

      // Sincronizar com Firebase
      if (matricula) {
        await syncProfile({ ...measurement, type: 'health_measurement' });
      }

      // Limpar formulário
      setWeight('');
      setHeight('');
      setGlucose('');
      setSystolic('');
      setDiastolic('');
      setNotes('');

      Alert.alert('Sucesso', 'Medição salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar medição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a medição');
    } finally {
      setLoading(false);
    }
  };

  const renderMeasurementCard = (measurement: HealthMeasurement, index: number) => {
    const imcRisk = measurement.imc ? getIMCRisk(measurement.imc) : null;
    const glucoseRisk = measurement.glucose ? getGlucoseRisk(measurement.glucose) : null;
    const pressureRisk = measurement.systolic && measurement.diastolic 
      ? getPressureRisk(measurement.systolic, measurement.diastolic) 
      : null;

    return (
      <View key={index} style={styles.measurementCard}>
        <View style={styles.measurementHeader}>
          <Text style={styles.measurementDate}>{measurement.date}</Text>
          <Text style={styles.measurementTime}>
            {new Date(measurement.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.measurementGrid}>
          {/* IMC */}
          {measurement.imc && imcRisk && (
            <View style={styles.measurementItem}>
              <View style={[styles.riskBadge, { backgroundColor: imcRisk.color }]}>
                <Text style={styles.riskBadgeText}>IMC</Text>
              </View>
              <Text style={styles.measurementValue}>{measurement.imc.toFixed(1)}</Text>
              <Text style={styles.measurementLabel}>{imcRisk.message}</Text>
            </View>
          )}

          {/* Glicemia */}
          {measurement.glucose && glucoseRisk && (
            <View style={styles.measurementItem}>
              <View style={[styles.riskBadge, { backgroundColor: glucoseRisk.color }]}>
                <Text style={styles.riskBadgeText}>Glicose</Text>
              </View>
              <Text style={styles.measurementValue}>{measurement.glucose}</Text>
              <Text style={styles.measurementLabel}>mg/dL</Text>
            </View>
          )}

          {/* Pressão */}
          {measurement.systolic && measurement.diastolic && pressureRisk && (
            <View style={styles.measurementItem}>
              <View style={[styles.riskBadge, { backgroundColor: pressureRisk.color }]}>
                <Text style={styles.riskBadgeText}>Pressão</Text>
              </View>
              <Text style={styles.measurementValue}>
                {measurement.systolic}/{measurement.diastolic}
              </Text>
              <Text style={styles.measurementLabel}>mmHg</Text>
            </View>
          )}
        </View>

        {measurement.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Observações:</Text>
            <Text style={styles.notesText}>{measurement.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#00A86B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Triagem de Saúde</Text>
        <Text style={styles.headerSubtitle}>Monitore seus indicadores de saúde</Text>
      </View>

      {/* Formulário de Entrada */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registrar Medições</Text>

        {/* Peso e Altura */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 75"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 175"
              keyboardType="decimal-pad"
              value={height}
              onChangeText={setHeight}
              editable={!loading}
            />
          </View>
        </View>

        {/* Glicemia */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Glicemia (mg/dL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 95"
              keyboardType="decimal-pad"
              value={glucose}
              onChangeText={setGlucose}
              editable={!loading}
            />
          </View>
        </View>

        {/* Pressão Arterial */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pressão Sistólica</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 120"
              keyboardType="decimal-pad"
              value={systolic}
              onChangeText={setSystolic}
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pressão Diastólica</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 80"
              keyboardType="decimal-pad"
              value={diastolic}
              onChangeText={setDiastolic}
              editable={!loading}
            />
          </View>
        </View>

        {/* Observações */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Observações (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Senti-me bem durante o dia"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            editable={!loading}
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSaveMeasurement}
          disabled={loading}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="white" />
          <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Medição'}</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico de Medições */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Histórico</Text>
        {measurements.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma medição registrada ainda</Text>
        ) : (
          measurements.map((measurement, index) => renderMeasurementCard(measurement, index))
        )}
      </View>

      {/* Informações de Risco */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Guia de Referência</Text>

        <View style={styles.referenceItem}>
          <Text style={styles.referenceTitle}>📊 IMC (Índice de Massa Corporal)</Text>
          <Text style={styles.referenceText}>• Abaixo de 18,5: Abaixo do peso</Text>
          <Text style={styles.referenceText}>• 18,5 a 24,9: Peso normal</Text>
          <Text style={styles.referenceText}>• 25 a 29,9: Sobrepeso</Text>
          <Text style={styles.referenceText}>• 30 ou mais: Obesidade</Text>
        </View>

        <View style={styles.referenceItem}>
          <Text style={styles.referenceTitle}>🩸 Glicemia (em jejum)</Text>
          <Text style={styles.referenceText}>• Abaixo de 70: Hipoglicemia</Text>
          <Text style={styles.referenceText}>• 70 a 99: Normal</Text>
          <Text style={styles.referenceText}>• 100 a 125: Elevada</Text>
          <Text style={styles.referenceText}>• 126 ou mais: Alerta de Diabetes</Text>
        </View>

        <View style={styles.referenceItem}>
          <Text style={styles.referenceTitle}>❤️ Pressão Arterial</Text>
          <Text style={styles.referenceText}>• Abaixo de 90/60: Pressão baixa</Text>
          <Text style={styles.referenceText}>• 90/60 a 119/79: Normal</Text>
          <Text style={styles.referenceText}>• 120/80 a 139/89: Elevada</Text>
          <Text style={styles.referenceText}>• 140/90 ou mais: Hipertensão</Text>
        </View>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#00A86B',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  primaryButton: {
    backgroundColor: '#00A86B',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  measurementCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00A86B',
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  measurementDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  measurementTime: {
    fontSize: 12,
    color: '#999',
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  measurementItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  riskBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  measurementLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notesContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  referenceItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  spacing: {
    height: 40,
  },
});
