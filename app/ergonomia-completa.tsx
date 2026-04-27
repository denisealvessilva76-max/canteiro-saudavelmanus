import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  category: 'alongamento' | 'postura' | 'respiracao' | 'pausa';
  duration: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  steps: string[];
  benefits: string[];
  videoUrl?: string;
  icon: string;
}

const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Alongamento de Pescoço',
    category: 'alongamento',
    duration: '2 min',
    difficulty: 'fácil',
    description: 'Reduz tensão no pescoço e ombros',
    steps: [
      'Sente-se com a coluna reta',
      'Incline a cabeça para o lado direito',
      'Mantenha por 15-20 segundos',
      'Repita do lado esquerdo',
      'Faça 3 séries de cada lado',
    ],
    benefits: ['Reduz tensão', 'Melhora circulação', 'Alivia dor de cabeça'],
    icon: 'head-side',
  },
  {
    id: '2',
    name: 'Alongamento de Ombros',
    category: 'alongamento',
    duration: '3 min',
    difficulty: 'fácil',
    description: 'Flexibiliza os ombros e costas',
    steps: [
      'De pé ou sentado, coloque a mão direita sobre o ombro esquerdo',
      'Com a mão esquerda, puxe o cotovelo direito para o lado',
      'Mantenha por 20-30 segundos',
      'Repita do outro lado',
      'Faça 3 séries',
    ],
    benefits: ['Flexibilidade', 'Reduz rigidez', 'Melhora postura'],
    icon: 'arm-flex',
  },
  {
    id: '3',
    name: 'Postura Correta Sentado',
    category: 'postura',
    duration: '1 min',
    difficulty: 'fácil',
    description: 'Aprenda a posição correta para trabalhar',
    steps: [
      'Sente-se com os pés apoiados no chão',
      'Mantenha as costas retas contra a cadeira',
      'Cotovelos em ângulo de 90°',
      'Tela do computador na altura dos olhos',
      'Ombros relaxados, não levantados',
    ],
    benefits: ['Previne dor nas costas', 'Melhora respiração', 'Aumenta produtividade'],
    icon: 'chair-rolling',
  },
  {
    id: '4',
    name: 'Postura Correta em Pé',
    category: 'postura',
    duration: '1 min',
    difficulty: 'fácil',
    description: 'Mantenha a coluna alinhada ao trabalhar em pé',
    steps: [
      'Pés afastados na largura dos ombros',
      'Distribua o peso igualmente nos dois pés',
      'Mantenha as costas retas',
      'Ombros para trás e relaxados',
      'Cabeça alinhada com a coluna',
    ],
    benefits: ['Reduz fadiga', 'Previne lesões', 'Melhora circulação'],
    icon: 'human-male-height',
  },
  {
    id: '5',
    name: 'Respiração Profunda',
    category: 'respiracao',
    duration: '5 min',
    difficulty: 'fácil',
    description: 'Técnica para relaxar e oxigenar o corpo',
    steps: [
      'Sente-se confortavelmente',
      'Inspire lentamente pelo nariz por 4 segundos',
      'Mantenha por 4 segundos',
      'Expire lentamente pela boca por 4 segundos',
      'Repita 10 vezes',
    ],
    benefits: ['Reduz estresse', 'Melhora oxigenação', 'Acalma a mente'],
    icon: 'lung',
  },
  {
    id: '6',
    name: 'Pausa Ativa - Caminhada',
    category: 'pausa',
    duration: '10 min',
    difficulty: 'fácil',
    description: 'Movimento leve para quebrar a rotina',
    steps: [
      'Levante-se da cadeira',
      'Caminhe pelo local de trabalho',
      'Mantenha um ritmo confortável',
      'Aproveite para beber água',
      'Retorne ao trabalho revigorado',
    ],
    benefits: ['Melhora circulação', 'Aumenta energia', 'Reduz fadiga'],
    icon: 'walk',
  },
  {
    id: '7',
    name: 'Alongamento de Costas',
    category: 'alongamento',
    duration: '3 min',
    difficulty: 'médio',
    description: 'Alonga toda a musculatura das costas',
    steps: [
      'De pé, pés afastados na largura dos ombros',
      'Coloque as mãos atrás da cabeça',
      'Incline o tronco para frente lentamente',
      'Mantenha por 20-30 segundos',
      'Retorne à posição inicial',
      'Repita 3 vezes',
    ],
    benefits: ['Reduz tensão', 'Melhora flexibilidade', 'Alivia dor nas costas'],
    icon: 'yoga',
  },
  {
    id: '8',
    name: 'Exercício de Pulso',
    category: 'alongamento',
    duration: '2 min',
    difficulty: 'fácil',
    description: 'Previne lesões por esforço repetitivo',
    steps: [
      'Estenda o braço direito à frente',
      'Com a mão esquerda, puxe os dedos para trás',
      'Mantenha por 15-20 segundos',
      'Repita do outro lado',
      'Faça 3 séries',
    ],
    benefits: ['Previne LER', 'Melhora flexibilidade', 'Reduz dor'],
    icon: 'hand-right',
  },
];

const WORK_TYPES = [
  {
    type: 'Administrativa',
    exercises: ['1', '2', '3', '5', '8'],
    description: 'Trabalho em escritório com computador',
  },
  {
    type: 'Operacional Leve',
    exercises: ['1', '2', '4', '6', '7'],
    description: 'Trabalho que envolve movimento moderado',
  },
  {
    type: 'Operacional Pesada',
    exercises: ['1', '2', '4', '5', '6', '7'],
    description: 'Trabalho físico intenso',
  },
];

export default function ErgonomiaCompletaScreen() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const filteredExercises = selectedCategory === 'todos'
    ? EXERCISES
    : EXERCISES.filter(ex => ex.category === selectedCategory);

  const renderExerciseDetail = (exercise: Exercise) => (
    <View style={styles.detailContainer}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setSelectedExercise(null)}
      >
        <MaterialCommunityIcons name="close" size={24} color="#333" />
      </TouchableOpacity>

              <View style={styles.detailHeader}>
        <MaterialCommunityIcons name={exercise.icon as any} size={48} color="#00A86B" />
        <Text style={styles.detailTitle}>{exercise.name}</Text>
        <View style={styles.detailMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock" size={16} color="#666" />
            <Text style={styles.metaText}>{exercise.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="dumbbell" size={16} color="#666" />
            <Text style={styles.metaText}>{exercise.difficulty}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.detailDescription}>{exercise.description}</Text>

      {/* Passos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Passo a Passo</Text>
        {exercise.steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Benefícios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Benefícios</Text>
        {exercise.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#00A86B" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Botão Começar */}
      <TouchableOpacity style={styles.startButton}>
        <MaterialCommunityIcons name="play-circle" size={20} color="white" />
        <Text style={styles.startButtonText}>Começar Exercício</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#00A86B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏋️ Ergonomia e Exercícios</Text>
        <Text style={styles.headerSubtitle}>Cuide da sua saúde durante o trabalho</Text>
      </View>

      {selectedExercise ? (
        <View style={styles.detailView}>
          {renderExerciseDetail(selectedExercise)}
        </View>
      ) : (
        <>
          {/* Filtro de Categorias */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['todos', 'alongamento', 'postura', 'respiracao', 'pausa'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterButton,
                    selectedCategory === cat && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedCategory === cat && styles.filterButtonTextActive,
                    ]}
                  >
                    {cat === 'todos' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lista de Exercícios */}
          <View style={styles.exercisesContainer}>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => setSelectedExercise(exercise)}
              >
                <View style={styles.exerciseIcon}>
                  <MaterialCommunityIcons name={exercise.icon as any} size={32} color="#00A86B" />
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseMetaText}>⏱️ {exercise.duration}</Text>
                    <Text style={styles.exerciseMetaText}>📊 {exercise.difficulty}</Text>
                  </View>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={24} color="#DDD" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Recomendações por Tipo de Trabalho */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💼 Recomendações por Tipo de Trabalho</Text>

            {WORK_TYPES.map((work, index) => (
              <View key={index} style={styles.workTypeCard}>
                <Text style={styles.workTypeName}>{work.type}</Text>
                <Text style={styles.workTypeDescription}>{work.description}</Text>
                <View style={styles.recommendedExercises}>
                  {work.exercises.map((exId) => {
                    const ex = EXERCISES.find(e => e.id === exId);
                    return ex ? (
                      <View key={exId} style={styles.recommendedTag}>
                        <Text style={styles.recommendedTagText}>{ex.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Dicas Gerais */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💡 Dicas Gerais de Ergonomia</Text>

            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Faça pausas a cada 50 minutos de trabalho</Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Mantenha a tela do computador na altura dos olhos</Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Beba água regularmente para manter a hidratação</Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Use cadeira com apoio adequado para as costas</Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Evite permanecer na mesma posição por muito tempo</Text>
            </View>
          </View>

          <View style={styles.spacing} />
        </>
      )}
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
  filterContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#00A86B',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  exercisesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseMetaText: {
    fontSize: 12,
    color: '#666',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  workTypeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00A86B',
  },
  workTypeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workTypeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  recommendedExercises: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recommendedTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  recommendedTagText: {
    fontSize: 11,
    color: '#00A86B',
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  detailView: {
    flex: 1,
  },
  detailContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 15,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  detailMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  startButton: {
    backgroundColor: '#00A86B',
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  spacing: {
    height: 40,
  },
});
