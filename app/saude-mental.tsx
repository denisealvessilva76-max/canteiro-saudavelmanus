import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface RespirationStep {
  phase: string;
  duration: number;
  instruction: string;
}

const BREATHING_TECHNIQUE: RespirationStep[] = [
  { phase: 'Inspire', duration: 4, instruction: 'Inspire pelo nariz por 4 segundos' },
  { phase: 'Prenda', duration: 7, instruction: 'Prenda a respiração por 7 segundos' },
  { phase: 'Expire', duration: 8, instruction: 'Expire pela boca por 8 segundos' },
];

const EMERGENCY_CONTACTS = [
  {
    name: 'Psicóloga/Analista - Brenda',
    role: 'Atendimento presencial na obra ou teleconsulta',
    phone: '(31) 99589-2351',
    whatsapp: 'https://wa.me/5531995892351?text=Olá%20Brenda,%20gostaria%20de%20agendar%20uma%20consulta',
  },
  {
    name: 'Assistente Social - Luciana',
    role: 'Orientação e apoio em questões sociais',
    phone: '(31) 99589-2351',
    whatsapp: 'https://wa.me/5531995892351?text=Olá%20Luciana,%20preciso%20de%20orientação%20social',
  },
];

const EMERGENCY_RESOURCES = [
  {
    name: 'CVV - 188 (Gratuito)',
    description: 'Apoio emocional 24h. Ligue ou chat online',
    phone: '188',
    color: '#FF6B6B',
  },
  {
    name: 'CAPS - Canal dos Caraços',
    description: 'Centro de Atenção Psicossocial',
    phone: '(31) 3333-3333',
    color: '#4ECDC4',
  },
];

export default function SaudeMentalScreen() {
  const router = useRouter();
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BREATHING_TECHNIQUE[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const breathingProgress = new Animated.Value(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isBreathing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        
        // Animar progresso
        Animated.timing(breathingProgress, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start(() => {
          breathingProgress.setValue(0);
        });
      }, 1000);
    } else if (isBreathing && timeLeft === 0) {
      // Próximo passo
      if (currentStep < BREATHING_TECHNIQUE.length - 1) {
        setCurrentStep(currentStep + 1);
        setTimeLeft(BREATHING_TECHNIQUE[currentStep + 1].duration);
      } else {
        // Ciclo completo
        setCompletedCycles(completedCycles + 1);
        setCurrentStep(0);
        setTimeLeft(BREATHING_TECHNIQUE[0].duration);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing, timeLeft, currentStep, completedCycles]);

  const handleStartBreathing = () => {
    setIsBreathing(true);
    setCurrentStep(0);
    setTimeLeft(BREATHING_TECHNIQUE[0].duration);
    setCompletedCycles(0);
  };

  const handleStopBreathing = () => {
    setIsBreathing(false);
    saveBreathingSession();
  };

  const saveBreathingSession = async () => {
    try {
      const session = {
        date: new Date().toISOString(),
        cycles: completedCycles,
        timestamp: Date.now(),
      };

      const existing = await AsyncStorage.getItem('health:breathing_sessions');
      const sessions = existing ? JSON.parse(existing) : [];
      sessions.push(session);

      await AsyncStorage.setItem('health:breathing_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Erro ao salvar sessão de respiração:', error);
    }
  };

  const handleWhatsAppContact = (whatsappUrl: string) => {
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  const handlePhoneCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível fazer a chamada');
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#00A86B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❤️ Saúde Mental</Text>
        <Text style={styles.headerSubtitle}>Você não está sozinho. Aqui estão recursos para te ajudar.</Text>
      </View>

      {/* Técnica de Respiração */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="lungs" size={28} color="#00A86B" />
          <Text style={styles.cardTitle}>Técnica de Respiração 4-7-8</Text>
        </View>

        {!isBreathing ? (
          <View style={styles.breathingInfo}>
            <Text style={styles.breathingDescription}>
              Uma técnica simples para reduzir ansiedade e acalmar a mente. Inspire por 4 segundos, prenda por 7 e expire por 8.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartBreathing}
            >
              <MaterialCommunityIcons name="play-circle" size={20} color="white" />
              <Text style={styles.buttonText}>Iniciar Técnica</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.breathingSession}>
          <View style={styles.breathingCircle}>
            <Text style={styles.breathingTime}>{timeLeft}</Text>
            <Text style={styles.breathingPhase}>{BREATHING_TECHNIQUE[currentStep].phase}</Text>
          </View>

            <Text style={styles.breathingInstruction}>
              {BREATHING_TECHNIQUE[currentStep].instruction}
            </Text>

            <Text style={styles.cycleCounter}>
              Ciclo {completedCycles + 1} em progresso
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleStopBreathing}
            >
              <MaterialCommunityIcons name="stop-circle" size={20} color="#00A86B" />
              <Text style={styles.secondaryButtonText}>Parar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profissionais de Saúde Mental */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="hospital-box" size={28} color="#00A86B" />
          <Text style={styles.cardTitle}>Profissionais da Obra</Text>
        </View>

        {EMERGENCY_CONTACTS.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRole}>{contact.role}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handlePhoneCall(contact.phone.replace(/\D/g, ''))}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#00A86B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleWhatsAppContact(contact.whatsapp)}
              >
                <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          ✓ Sigilo profissional garantido por lei. Suas informações são confidenciais e não serão compartilhadas sem sua autorização.
        </Text>
      </View>

      {/* Recursos de Emergência */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="alert-circle" size={28} color="#FF6B6B" />
          <Text style={styles.cardTitle}>Recursos de Emergência</Text>
        </View>

        {EMERGENCY_RESOURCES.map((resource, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.emergencyCard, { borderLeftColor: resource.color }]}
            onPress={() => handlePhoneCall(resource.phone.replace(/\D/g, ''))}
          >
            <View>
              <Text style={styles.emergencyName}>{resource.name}</Text>
              <Text style={styles.emergencyDescription}>{resource.description}</Text>
              <Text style={styles.emergencyPhone}>{resource.phone}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Dicas de Bem-estar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="lightbulb" size={28} color="#FFD700" />
          <Text style={styles.cardTitle}>Dicas para o Dia a Dia</Text>
        </View>

        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🧘</Text>
            <Text style={styles.tipText}>Pratique meditação ou respiração profunda por 5 minutos diariamente</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🚶</Text>
            <Text style={styles.tipText}>Faça pausas regulares durante o trabalho para caminhar</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>😴</Text>
            <Text style={styles.tipText}>Durma bem! O descanso é essencial para a saúde mental</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>👥</Text>
            <Text style={styles.tipText}>Converse com colegas e amigos sobre seus sentimentos</Text>
          </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  breathingInfo: {
    alignItems: 'center',
  },
  breathingDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#00A86B',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  breathingSession: {
    alignItems: 'center',
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#00A86B',
  },
  breathingTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  breathingPhase: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  breathingInstruction: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  cycleCounter: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00A86B',
  },
  secondaryButtonText: {
    color: '#00A86B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    marginTop: 15,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emergencyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  emergencyPhone: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  spacing: {
    height: 40,
  },
});
