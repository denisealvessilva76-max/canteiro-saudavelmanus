import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const STRETCHES = [
  {
    id: 1,
    name: 'Alongamento de Pescoço',
    description: 'Incline a cabeça para cada lado, mantendo por 20 segundos',
    duration: 40,
    image: '🧠',
  },
  {
    id: 2,
    name: 'Alongamento de Ombros',
    description: 'Levante os ombros em direção às orelhas, mantendo por 15 segundos cada',
    duration: 30,
    image: '💪',
  },
  {
    id: 3,
    name: 'Alongamento de Costas',
    description: 'Incline o tronco para trás suavemente, mantendo por 20 segundos',
    duration: 20,
    image: '🔙',
  },
  {
    id: 4,
    name: 'Alongamento de Pernas',
    description: 'Sente-se e incline para frente, mantendo por 30 segundos',
    duration: 30,
    image: '🦵',
  },
];

interface StretchingGuideProps {
  onClose?: () => void;
}

export function StretchingGuide({ onClose }: StretchingGuideProps) {
  const [currentStretch, setCurrentStretch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(STRETCHES[0].duration);
  const [showNarration, setShowNarration] = useState(true);
  const player = useAudioPlayer(require('@/assets/audio/alongamentos-naracao.mp3'));

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentStretch < STRETCHES.length - 1) {
            setCurrentStretch(currentStretch + 1);
            setTimeLeft(STRETCHES[currentStretch + 1].duration);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } else {
            setIsPlaying(false);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentStretch]);

  const handlePlayNarration = async () => {
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      } else {
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  };

  const handleStartExercise = () => {
    setIsPlaying(true);
    setTimeLeft(STRETCHES[currentStretch].duration);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (currentStretch < STRETCHES.length - 1) {
      setCurrentStretch(currentStretch + 1);
      setTimeLeft(STRETCHES[currentStretch + 1].duration);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentStretch > 0) {
      setCurrentStretch(currentStretch - 1);
      setTimeLeft(STRETCHES[currentStretch - 1].duration);
      setIsPlaying(false);
    }
  };

  const stretch = STRETCHES[currentStretch];
  const progress = ((currentStretch + 1) / STRETCHES.length) * 100;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        {/* Progresso */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-muted">
            {currentStretch + 1} de {STRETCHES.length}
          </Text>
          <View className="h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Alongamento Atual */}
        <View className="bg-surface rounded-2xl p-6 items-center gap-4">
          <Text className="text-6xl">{stretch.image}</Text>
          <Text className="text-2xl font-bold text-foreground text-center">
            {stretch.name}
          </Text>
          <Text className="text-base text-muted text-center">
            {stretch.description}
          </Text>

          {/* Contador */}
          <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-5xl font-bold text-primary">
              {timeLeft}s
            </Text>
          </View>

          {/* Controles */}
          <View className="flex-row gap-3 w-full justify-center">
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentStretch === 0}
              className="px-4 py-2 bg-border rounded-lg disabled:opacity-50"
            >
              <Text className="text-foreground font-semibold">← Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartExercise}
              className="px-6 py-2 bg-primary rounded-lg"
            >
              <Text className="text-white font-semibold">
                {isPlaying ? 'Pausar' : 'Iniciar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentStretch === STRETCHES.length - 1}
              className="px-4 py-2 bg-border rounded-lg disabled:opacity-50"
            >
              <Text className="text-foreground font-semibold">Próximo →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Narração */}
        <View className="bg-surface rounded-2xl p-4 gap-3">
          <Text className="text-base font-semibold text-foreground">
            🔊 Narração de Áudio
          </Text>
          <TouchableOpacity
            onPress={handlePlayNarration}
            className="bg-primary p-4 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">
              {showNarration ? '▶️ Ouvir Narração' : '⏸️ Pausar'}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-muted">
            Ouça as instruções de voz para cada alongamento
          </Text>
        </View>

        {/* Opções */}
        <View className="bg-surface rounded-2xl p-4 gap-3">
          <Text className="text-base font-semibold text-foreground">
            📺 Outras Opções
          </Text>
          <TouchableOpacity className="bg-primary p-3 rounded-lg items-center">
            <Text className="text-white font-semibold">
              🎬 Ver no YouTube
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão Fechar */}
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            className="bg-error p-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">Fechar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
