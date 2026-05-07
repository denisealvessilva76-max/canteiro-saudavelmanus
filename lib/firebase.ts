import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, off, get } from 'firebase/database';

/**
 * Configuração do Firebase Realtime Database
 * 
 * Para usar, configure as variáveis de ambiente:
 * - FIREBASE_API_KEY
 * - FIREBASE_AUTH_DOMAIN
 * - FIREBASE_DATABASE_URL
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_STORAGE_BUCKET
 * - FIREBASE_MESSAGING_SENDER_ID
 * - FIREBASE_APP_ID
 */

// EXPO_PUBLIC_* vars são embutidas no bundle web pelo Metro bundler
// process.env.FIREBASE_* são apenas para o servidor Node.js
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || 'https://demo.firebaseio.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'demo',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

// Inicializar Firebase (apenas uma vez)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] Initialized');
} else {
  app = getApp();
  console.log('[Firebase] Already initialized');
}

// Obter referência do banco de dados
const database = getDatabase(app);

/**
 * Salvar dados de um funcionário no Firebase
 * Estrutura: canteiro-saudavel/employees/{matricula}/{chave}
 */
export async function saveToFirebase(
  matricula: string,
  chave: string,
  dados: any
): Promise<void> {
  try {
    const dbRef = ref(database, `canteiro-saudavel/employees/${matricula}/${chave}`);
    await set(dbRef, dados);
    console.log(`[Firebase] Saved ${chave} for ${matricula}`);
  } catch (error) {
    console.error(`[Firebase] Error saving ${chave}:`, error);
    throw error;
  }
}

/**
 * Adicionar item a um array no Firebase
 * Estrutura: canteiro-saudavel/employees/{matricula}/{chave}/{pushId}
 */
export async function pushToFirebase(
  matricula: string,
  chave: string,
  dado: any
): Promise<string> {
  try {
    const dbRef = ref(database, `canteiro-saudavel/employees/${matricula}/${chave}`);
    const newRef = push(dbRef);
    await set(newRef, {
      ...dado,
      timestamp: Date.now(),
    });
    console.log(`[Firebase] Pushed to ${chave} for ${matricula}`);
    return newRef.key!;
  } catch (error) {
    console.error(`[Firebase] Error pushing to ${chave}:`, error);
    throw error;
  }
}

/**
 * Obter dados de um funcionário do Firebase
 */
export async function getFromFirebase(
  matricula: string,
  chave: string
): Promise<any | null> {
  try {
    const dbRef = ref(database, `canteiro-saudavel/employees/${matricula}/${chave}`);
    const snapshot = await get(dbRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return null;
  } catch (error) {
    console.error(`[Firebase] Error getting ${chave}:`, error);
    return null;
  }
}

/**
 * Escutar mudanças em tempo real
 */
export function listenToFirebase(
  matricula: string,
  chave: string,
  callback: (data: any) => void
): () => void {
  const dbRef = ref(database, `canteiro-saudavel/employees/${matricula}/${chave}`);
  
  onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  // Retornar função para parar de escutar
  return () => off(dbRef);
}

/**
 * Obter todos os funcionários (para dashboard admin)
 */
export async function getAllEmployees(): Promise<any[]> {
  try {
    const dbRef = ref(database, 'canteiro-saudavel/employees');
    const snapshot = await get(dbRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map((matricula) => ({
        matricula,
        ...data[matricula].profile,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('[Firebase] Error getting all employees:', error);
    return [];
  }
}

/**
 * Escutar todos os funcionários em tempo real (para dashboard admin)
 */
export function listenToAllEmployees(
  callback: (employees: any[]) => void
): () => void {
  const dbRef = ref(database, 'canteiro-saudavel/employees');
  
  onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const employees = Object.keys(data).map((matricula) => ({
        matricula,
        ...data[matricula].profile,
      }));
      callback(employees);
    } else {
      callback([]);
    }
  });
  
  return () => off(dbRef);
}

export { database };

/**
 * Sincronizar dados de check-in
 */
export async function syncCheckIn(
  matricula: string,
  date: string,
  status: 'bem' | 'dor_leve' | 'dor_forte',
  points: number
): Promise<void> {
  try {
    await saveToFirebase(matricula, `checkIns/${date}`, {
      date,
      status,
      points,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Firebase] Error syncing check-in:', error);
  }
}

/**
 * Sincronizar dados de hidratação
 */
export async function syncHydration(
  matricula: string,
  date: string,
  cups: number,
  total: number,
  goal: number
): Promise<void> {
  try {
    await saveToFirebase(matricula, `hydration/${date}`, {
      date,
      cups,
      total,
      goal,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Firebase] Error syncing hydration:', error);
  }
}

/**
 * Sincronizar dados de pressão arterial
 */
export async function syncPressure(
  matricula: string,
  systolic: number,
  diastolic: number,
  status: 'normal' | 'elevada' | 'alta'
): Promise<void> {
  try {
    await pushToFirebase(matricula, 'pressure', {
      systolic,
      diastolic,
      status,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Firebase] Error syncing pressure:', error);
  }
}

/**
 * Sincronizar sintomas
 */
export async function syncSymptoms(
  matricula: string,
  date: string,
  symptoms: string[]
): Promise<void> {
  try {
    await saveToFirebase(matricula, `symptoms/${date}`, {
      date,
      symptoms,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Firebase] Error syncing symptoms:', error);
  }
}

/**
 * Sincronizar pontos e recompensas
 */
export async function syncPoints(
  matricula: string,
  points: number,
  level: number
): Promise<void> {
  try {
    await saveToFirebase(matricula, 'profile/points', {
      points,
      level,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Firebase] Error syncing points:', error);
  }
}

/**
 * Sincronizar resgates de recompensas
 */
export async function syncRedemption(
  matricula: string,
  rewardName: string,
  pointsSpent: number
): Promise<void> {
  try {
    await pushToFirebase(matricula, 'redemptions', {
      reward: rewardName,
      pointsSpent,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Firebase] Error syncing redemption:', error);
  }
}

/**
 * Obter histórico de check-ins
 */
export async function getCheckInHistory(
  matricula: string,
  days: number = 30
): Promise<any[]> {
  try {
    const checkIns = await getFromFirebase(matricula, 'checkIns');
    if (!checkIns) return [];
    
    const now = Date.now();
    const thirtyDaysAgo = now - days * 24 * 60 * 60 * 1000;
    
    return Object.values(checkIns).filter((checkIn: any) => {
      return checkIn.timestamp >= thirtyDaysAgo;
    });
  } catch (error) {
    console.error('[Firebase] Error getting check-in history:', error);
    return [];
  }
}

/**
 * Obter histórico de pressão
 */
export async function getPressureHistory(
  matricula: string,
  days: number = 30
): Promise<any[]> {
  try {
    const pressures = await getFromFirebase(matricula, 'pressure');
    if (!pressures) return [];
    
    const now = Date.now();
    const thirtyDaysAgo = now - days * 24 * 60 * 60 * 1000;
    
    return Object.values(pressures).filter((pressure: any) => {
      return pressure.timestamp >= thirtyDaysAgo;
    });
  } catch (error) {
    console.error('[Firebase] Error getting pressure history:', error);
    return [];
  }
}

/**
 * Obter histórico de sintomas
 */
export async function getSymptomsHistory(
  matricula: string,
  days: number = 30
): Promise<any[]> {
  try {
    const symptoms = await getFromFirebase(matricula, 'symptoms');
    if (!symptoms) return [];
    
    const now = Date.now();
    const thirtyDaysAgo = now - days * 24 * 60 * 60 * 1000;
    
    return Object.values(symptoms).filter((symptom: any) => {
      return symptom.timestamp >= thirtyDaysAgo;
    });
  } catch (error) {
    console.error('[Firebase] Error getting symptoms history:', error);
    return [];
  }
}

/**
 * Obter histórico de hidratação
 */
export async function getHydrationHistory(
  matricula: string,
  days: number = 30
): Promise<any[]> {
  try {
    const hydration = await getFromFirebase(matricula, 'hydration');
    if (!hydration) return [];
    
    const now = Date.now();
    const thirtyDaysAgo = now - days * 24 * 60 * 60 * 1000;
    
    return Object.values(hydration).filter((h: any) => {
      return h.timestamp >= thirtyDaysAgo;
    });
  } catch (error) {
    console.error('[Firebase] Error getting hydration history:', error);
    return [];
  }
}

/**
 * Obter histórico de resgates
 */
export async function getRedemptionHistory(
  matricula: string
): Promise<any[]> {
  try {
    const redemptions = await getFromFirebase(matricula, 'redemptions');
    if (!redemptions) return [];
    
    return Object.values(redemptions);
  } catch (error) {
    console.error('[Firebase] Error getting redemption history:', error);
    return [];
  }
}
