import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sincronização simples com Firebase Realtime Database
 * Salva dados localmente PRIMEIRO, depois sincroniza com Firebase
 */

const FIREBASE_URL = 'https://canteiro-saudavel.firebaseio.com';

interface EmployeeData {
  matricula: string;
  nome: string;
  email?: string;
  peso?: number;
  altura?: number;
  tipoTrabalho?: string;
  hydration?: {
    today: number;
    history: Array<{ amount: number; time: string; timestamp: string }>;
    lastUpdated: string;
  };
  health?: {
    pressure: Array<{ systolic: number; diastolic: number; timestamp: string }>;
    symptoms: number[];
    lastUpdated: string;
  };
  checkIns?: Array<{ date: string; timestamp: string }>;
}

/**
 * Salvar dados de funcionário no Firebase
 */
export async function syncEmployeeData(matricula: string, data: Partial<EmployeeData>) {
  try {
    console.log('[Firebase Sync] Sincronizando dados do funcionário:', matricula);

    // Sempre salvar localmente primeiro
    const localKey = `employee:${matricula}:data`;
    const existingData = await AsyncStorage.getItem(localKey);
    const merged = {
      ...JSON.parse(existingData || '{}'),
      ...data,
      lastSync: new Date().toISOString(),
    };
    await AsyncStorage.setItem(localKey, JSON.stringify(merged));

    // Tentar sincronizar com Firebase
    try {
      const response = await fetch(
        `${FIREBASE_URL}/canteiro-saudavel/employees/${matricula}.json`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged),
        }
      );

      if (!response.ok) {
        throw new Error(`Firebase error: ${response.status}`);
      }

      console.log('[Firebase Sync] Sincronização bem-sucedida para:', matricula);
      return true;
    } catch (firebaseError) {
      console.warn('[Firebase Sync] Erro ao sincronizar com Firebase:', firebaseError);
      // Marcar para sincronizar depois
      await markForSync(matricula, merged);
      return false;
    }
  } catch (error) {
    console.error('[Firebase Sync] Erro ao sincronizar dados:', error);
    throw error;
  }
}

/**
 * Marcar dados para sincronização posterior
 */
async function markForSync(matricula: string, data: any) {
  try {
    const queueKey = `sync:queue:${matricula}`;
    const existing = await AsyncStorage.getItem(queueKey);
    const queue = existing ? JSON.parse(existing) : [];
    queue.push({
      data,
      timestamp: new Date().toISOString(),
    });
    await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
    console.log('[Firebase Sync] Dados marcados para sincronização posterior');
  } catch (error) {
    console.error('[Firebase Sync] Erro ao marcar para sincronização:', error);
  }
}

/**
 * Sincronizar fila de dados pendentes
 */
export async function processSyncQueue(matricula: string) {
  try {
    const queueKey = `sync:queue:${matricula}`;
    const queueStr = await AsyncStorage.getItem(queueKey);
    if (!queueStr) return;

    const queue = JSON.parse(queueStr);
    if (queue.length === 0) return;

    console.log('[Firebase Sync] Processando fila de sincronização:', queue.length, 'itens');

    for (const item of queue) {
      try {
        const response = await fetch(
          `${FIREBASE_URL}/canteiro-saudavel/employees/${matricula}.json`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data),
          }
        );

        if (response.ok) {
          console.log('[Firebase Sync] Item sincronizado da fila');
        }
      } catch (error) {
        console.warn('[Firebase Sync] Erro ao processar item da fila:', error);
        break; // Parar se falhar
      }
    }

    // Limpar fila após processar
    await AsyncStorage.removeItem(queueKey);
    console.log('[Firebase Sync] Fila de sincronização limpa');
  } catch (error) {
    console.error('[Firebase Sync] Erro ao processar fila:', error);
  }
}

/**
 * Carregar dados de um funcionário do Firebase
 */
export async function loadEmployeeFromFirebase(matricula: string): Promise<EmployeeData | null> {
  try {
    console.log('[Firebase Sync] Carregando dados do funcionário:', matricula);

    const response = await fetch(
      `${FIREBASE_URL}/canteiro-saudavel/employees/${matricula}.json`
    );

    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status}`);
    }

    const data = await response.json();
    if (data) {
      // Salvar localmente
      await AsyncStorage.setItem(
        `employee:${matricula}:data`,
        JSON.stringify(data)
      );
      console.log('[Firebase Sync] Dados carregados e salvos localmente');
      return data;
    }

    return null;
  } catch (error) {
    console.warn('[Firebase Sync] Erro ao carregar do Firebase:', error);
    // Tentar carregar do cache local
    const cached = await AsyncStorage.getItem(`employee:${matricula}:data`);
    return cached ? JSON.parse(cached) : null;
  }
}

/**
 * Sincronizar hidratação
 */
export async function syncHydration(
  matricula: string,
  today: number,
  history: Array<{ amount: number; time: string; timestamp: string }>
) {
  return syncEmployeeData(matricula, {
    hydration: {
      today,
      history,
      lastUpdated: new Date().toISOString(),
    },
  });
}

/**
 * Sincronizar pressão
 */
export async function syncPressure(
  matricula: string,
  pressure: Array<{ systolic: number; diastolic: number; timestamp: string }>,
  symptoms: number[]
) {
  return syncEmployeeData(matricula, {
    health: {
      pressure,
      symptoms,
      lastUpdated: new Date().toISOString(),
    },
  });
}

/**
 * Sincronizar check-in
 */
export async function syncCheckIn(matricula: string) {
  return syncEmployeeData(matricula, {
    checkIns: [
      {
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
