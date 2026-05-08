/**
 * Tipos e interfaces para o sistema de desafios
 */

export type ChallengeType = 'water' | 'steps' | 'nutrition';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  goal: number;
  unit: string;
  color: string;
  isActive: boolean;
}

export interface ChallengeProgress {
  id: string;
  matricula: string;
  challengeId: string;
  challengeType: ChallengeType;
  date: string;
  progress: number;
  goal: number;
  completed: boolean;
  difficulty?: string;
  photos: string[];
  timestamp: number;
  syncedToFirebase?: boolean;
}

export interface ChallengeSubmission {
  id: string;
  matricula: string;
  challengeId: string;
  challengeType: ChallengeType;
  date: string;
  progress: number;
  goal: number;
  difficulty: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  timestamp: number;
  submittedAt: number;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-water',
    type: 'water',
    title: 'Hidratação Diária',
    description: 'Beba 2.5L de água durante o dia',
    icon: '💧',
    goal: 2500,
    unit: 'ml',
    color: '#3B82F6',
    isActive: true,
  },
  {
    id: 'challenge-steps',
    type: 'steps',
    title: 'Atividade Física',
    description: 'Caminhe 8.000 passos durante o dia',
    icon: '🚶',
    goal: 8000,
    unit: 'passos',
    color: '#10B981',
    isActive: true,
  },
  {
    id: 'challenge-nutrition',
    type: 'nutrition',
    title: 'Alimentação Saudável',
    description: 'Registre suas refeições saudáveis',
    icon: '🥗',
    goal: 3,
    unit: 'refeições',
    color: '#F59E0B',
    isActive: true,
  },
];
