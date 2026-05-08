import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type BreathingPhase = 'prepare' | 'inhale' | 'hold' | 'exhale' | 'complete';

interface GuidedBreathingProps {
  onClose?: () => void;
}

export function GuidedBreathing({ onClose }: GuidedBreathingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<BreathingPhase>('prepare');
  const [timeLeft, setTimeLeft] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const player = useAudioPlayer(require('@/assets/audio/respiracao-guiada-4-7-8.mp3'));

  const PHASES = {
    prepare: { duration: 3, label: 'Prepare-se', color: '#1B8A4C' },
    inhale: { duration: 4, label: 'Inspire (4s)', color: '#3B82F6' },
    hold: { duration: 7, label: 'Segure (7s)', color: '#F59E0B' },
    exhale: { duration: 8, label: 'Expire (8s)', color: '#8B5CF6' },
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transição para próxima fase
          if (phase === 'prepare') {
            setPhase('inhale');
            setTimeLeft(PHASES.inhale.duration);
          } else if (phase === 'inhale') {
            setPhase('hold');
            setTimeLeft(PHASES.hold.duration);
          } else if (phase === 'hold') {
            setPhase('exhale');
            setTimeLeft(PHASES.exhale.duration);
          } else if (phase === 'exhale') {
            if (currentRound < 4) {
              setCurrentRound(currentRound + 1);
              setPhase('inhale');
              setTimeLeft(PHASES.inhale.duration);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } else {
              setPhase('complete');
              setIsPlaying(false);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, phase, currentRound]);

  // Animar círculo de respiração
  useEffect(() => {
    if (!isPlaying) return;

    const animation = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: phase === 'inhale' ? 4000 : phase === 'hold' ? 7000 : 8000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, [phase, isPlaying]);

  const handleStart = async () => {
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      } else {
        setCurrentRound(1);
        setPhase('prepare');
        setTimeLeft(PHASES.prepare.duration);
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentRound(1);
    setPhase('prepare');
    setTimeLeft(0);
    scaleAnim.setValue(1);
  };

  const phaseColor = phase === 'complete' ? '#22C55E' : PHASES[phase as keyof typeof PHASES]?.color || '#1B8A4C';
  const phaseLabel = phase === 'complete' ? 'Completo!' : PHASES[phase as keyof typeof PHASES]?.label || 'Prepare-se';

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        {/* Título */}
        <View className="items-center gap-2">
          <Text className="text-3xl font-bold text-foreground">
            🫁 Respiração Guiada
          </Text>
          <Text className="text-base text-muted">
            Técnica 4-7-8 para relaxamento
          </Text>
        </View>

        {/* Rodada Atual */}
        <View className="bg-surface rounded-2xl p-4 items-center">
          <Text className="text-sm font-semibold text-muted mb-2">
            Rodada {currentRound} de 4
          </Text>
          <View className="w-full h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${(currentRound / 4) * 100}%` }}
            />
          </View>
        </View>

        {/* Círculo de Respiração Animado */}
        <View className="items-center justify-center py-8">
          <Animated.View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: phaseColor,
              opacity: 0.2,
              transform: [{ scale: scaleAnim }],
            }}
          />
          <View className="absolute items-center">
            <View
              className="w-32 h-32 rounded-full items-center justify-center"
              style={{ backgroundColor: phaseColor }}
            >
              <Text className="text-5xl font-bold text-white">
                {timeLeft}
              </Text>
            </View>
            <Text className="text-base font-semibold text-foreground mt-4">
              {phaseLabel}
            </Text>
          </View>
        </View>

        {/* Instruções */}
        <View className="bg-surface rounded-2xl p-4 gap-2">
          <Text className="text-sm font-semibold text-foreground mb-2">
            📋 Instruções
          </Text>
          <View className="gap-2">
            <Text className="text-xs text-muted">
              • Inspire pelo nariz por 4 segundos
            </Text>
            <Text className="text-xs text-muted">
              • Segure a respiração por 7 segundos
            </Text>
            <Text className="text-xs text-muted">
              • Expire pela boca por 8 segundos
            </Text>
            <Text className="text-xs text-muted">
              • Repita 4 vezes
            </Text>
          </View>
        </View>

        {/* Controles */}
        <View className="flex-row gap-3 justify-center">
          <TouchableOpacity
            onPress={handleStart}
            className="flex-1 bg-primary p-4 rounded-lg items-center"
          >
            <Text className="text-white font-semibold text-base">
              {isPlaying ? '⏸️ Pausar' : '▶️ Iniciar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            className="flex-1 bg-border p-4 rounded-lg items-center"
          >
            <Text className="text-foreground font-semibold text-base">
              🔄 Resetar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        {phase === 'complete' && (
          <View className="bg-success/10 border border-success rounded-2xl p-4 items-center gap-2">
            <Text className="text-2xl">✨</Text>
            <Text className="text-base font-semibold text-success">
              Muito bem, você conseguiu!
            </Text>
            <Text className="text-sm text-muted text-center">
              Tenha um ótimo dia. Sinta-se calmo e relaxado.
            </Text>
          </View>
        )}

        {/* Dicas */}
        <View className="bg-surface rounded-2xl p-4 gap-2">
          <Text className="text-sm font-semibold text-foreground mb-2">
            💡 Dicas
          </Text>
          <Text className="text-xs text-muted">
            • Pratique em um local calmo e confortável
          </Text>
          <Text className="text-xs text-muted">
            • Sente-se com as costas retas
          </Text>
          <Text className="text-xs text-muted">
            • Feche os olhos para melhor concentração
          </Text>
          <Text className="text-xs text-muted">
            • Repita diariamente para melhores resultados
          </Text>
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
