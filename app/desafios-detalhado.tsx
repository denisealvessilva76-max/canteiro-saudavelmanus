import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useChallenges } from '@/hooks/use-challenges';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHALLENGES_LIST = [
  {
    id: 'water',
    title: 'Hidratação Diária',
    description: 'Beba 2.5L de água durante o dia',
    icon: '💧',
    goal: 2500,
    unit: 'ml',
    color: '#3B82F6',
  },
  {
    id: 'steps',
    title: 'Atividade Física',
    description: 'Caminhe 8.000 passos durante o dia',
    icon: '🚶',
    goal: 8000,
    unit: 'passos',
    color: '#10B981',
  },
  {
    id: 'nutrition',
    title: 'Alimentação Saudável',
    description: 'Registre suas refeições saudáveis',
    icon: '🥗',
    goal: 3,
    unit: 'refeições',
    color: '#F59E0B',
  },
];

interface ChallengeDetail {
  id: string;
  progress: number;
  difficulty: string;
  photos: string[];
  completed: boolean;
}

export default function DesafiosDetalhado() {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [challengeDetails, setChallengeDetails] = useState<ChallengeDetail | null>(null);
  const [difficulty, setDifficulty] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matricula, setMatricula] = useState('');

  useEffect(() => {
    loadMatricula();
  }, []);

  const loadMatricula = async () => {
    const mat = await AsyncStorage.getItem('employee:matricula');
    if (mat) setMatricula(mat);
  };

  const handleSelectChallenge = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    setChallengeDetails(null);
    setDifficulty('');
    setPhotos([]);
    setProgress(0);
  };

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmitChallenge = async () => {
    if (!selectedChallenge || progress === 0 || !difficulty.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const submission = {
        id: `${matricula}-${selectedChallenge}-${today}-${Date.now()}`,
        matricula,
        challengeId: selectedChallenge,
        date: today,
        progress,
        difficulty,
        photos,
        status: 'pending',
        timestamp: Date.now(),
      };

      // Salvar em AsyncStorage
      const key = `challenge:submission:${matricula}:${selectedChallenge}`;
      await AsyncStorage.setItem(key, JSON.stringify(submission));

      // Salvar na fila de sincronização
      const syncQueue = await AsyncStorage.getItem(`sync:queue:${matricula}`);
      const queue = syncQueue ? JSON.parse(syncQueue) : [];
      queue.push({
        type: 'challenge_submission',
        data: submission,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(`sync:queue:${matricula}`, JSON.stringify(queue));

      Alert.alert('Sucesso', 'Desafio submetido! Aguardando aprovação do administrador.');
      setSelectedChallenge(null);
      setDifficulty('');
      setPhotos([]);
      setProgress(0);

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível submeter o desafio');
    } finally {
      setLoading(false);
    }
  };

  const challenge = CHALLENGES_LIST.find((c) => c.id === selectedChallenge);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Desafios</Text>
          <Text style={styles.subtitle}>Complete desafios e ganhe pontos</Text>
        </View>

        {!selectedChallenge ? (
          <View style={styles.content}>
            {CHALLENGES_LIST.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                style={[styles.challengeCard, { borderLeftColor: ch.color }]}
                onPress={() => handleSelectChallenge(ch.id)}
              >
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeIcon}>{ch.icon}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{ch.title}</Text>
                    <Text style={styles.challengeDesc}>{ch.description}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
                <View style={styles.challengeGoal}>
                  <Text style={styles.goalText}>Meta: {ch.goal} {ch.unit}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.detailContent}>
            {/* Voltar */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedChallenge(null)}
            >
              <Text style={styles.backBtnText}>← Voltar</Text>
            </TouchableOpacity>

            {/* Detalhes do Desafio */}
            <View style={[styles.detailCard, { borderLeftColor: challenge?.color }]}>
              <Text style={styles.detailIcon}>{challenge?.icon}</Text>
              <Text style={styles.detailTitle}>{challenge?.title}</Text>
              <Text style={styles.detailDesc}>{challenge?.description}</Text>
              <View style={styles.goalBox}>
                <Text style={styles.goalLabel}>Meta:</Text>
                <Text style={styles.goalValue}>{challenge?.goal} {challenge?.unit}</Text>
              </View>
            </View>

            {/* Progresso */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Seu Progresso</Text>
              <View style={styles.progressContainer}>
                <TextInput
                  style={styles.progressInput}
                  placeholder={`Digite seu progresso (0-${challenge?.goal})`}
                  keyboardType="numeric"
                  value={progress.toString()}
                  onChangeText={(text) => setProgress(parseInt(text) || 0)}
                />
                <Text style={styles.progressUnit}>{challenge?.unit}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((progress / (challenge?.goal || 1)) * 100, 100)}%`,
                      backgroundColor: challenge?.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {Math.min(Math.round((progress / (challenge?.goal || 1)) * 100), 100)}% concluído
              </Text>
            </View>

            {/* Dificuldades */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>😓 Dificuldades Encontradas</Text>
              <TextInput
                style={styles.difficultyInput}
                placeholder="Descreva as dificuldades que encontrou..."
                multiline
                numberOfLines={3}
                value={difficulty}
                onChangeText={setDifficulty}
              />
              <Text style={styles.helperText}>
                Ex: Esqueci de beber água no período da tarde
              </Text>
            </View>

            {/* Fotos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Evidências (Fotos)</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={handleTakePhoto}
                >
                  <Text style={styles.photoBtnText}>📷 Tirar Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={handleAddPhoto}
                >
                  <Text style={styles.photoBtnText}>🖼️ Galeria</Text>
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <View style={styles.photoGrid}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo }} style={styles.photoImage} />
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Text style={styles.removePhotoBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.photoCount}>
                {photos.length} foto{photos.length !== 1 ? 's' : ''} adicionada{photos.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Botão Submeter */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmitChallenge}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Enviando...' : '✓ Submeter Desafio'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontWeight: '700',
    color: '#1B8A4C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    padding: 16,
    gap: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeIcon: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B8A4C',
    marginBottom: 2,
  },
  challengeDesc: {
    fontSize: 13,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#1B8A4C',
  },
  challengeGoal: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 8,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    fontSize: 48,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B8A4C',
  },
  detailDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  goalBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  goalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B8A4C',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B8A4C',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  progressInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  progressUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 50,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  difficultyInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: '#1B8A4C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  photoBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  photoCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#1B8A4C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
