import { useEffect, useCallback } from 'react';
import { saveToFirebase, pushToFirebase } from '@/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOfflineSync } from './use-offline-sync';

/**
 * Hook para sincronizar dados locais com Firebase
 * 
 * Estratégia:
 * 1. Salva SEMPRE no localStorage primeiro (garantia de persistência)
 * 2. Tenta sincronizar com Firebase em segundo plano
 * 3. Se falhar, marca para tentar novamente depois
 */

interface SyncOptions {
  matricula: string;
  enabled?: boolean;
}

export function useFirebaseSync({ matricula, enabled = true }: SyncOptions) {
  const { syncSave, syncPush } = useOfflineSync();

  /**
   * Sincronizar perfil do funcionário
   * Estrutura: canteiro-saudavel/employees/{matricula}/profile
   */
  const syncProfile = useCallback(async (profileData: any) => {
    if (!enabled || !matricula) return;
    
    try {
      // Salvar no localStorage primeiro
      await AsyncStorage.setItem(`employee:profile`, JSON.stringify(profileData));
      
      // Sincronizar com Firebase via fila offline
      await syncSave(matricula, 'profile', {
        ...profileData,
        updatedAt: Date.now()
      });
      console.log('[Sync] Profile sync queued');
    } catch (error) {
      console.error('[Sync] Error syncing profile:', error);
    }
  }, [matricula, enabled, syncSave]);

  /**
   * Sincronizar registro de água (Hidratação diária)
   * Estrutura: canteiro-saudavel/employees/{matricula}/hydration/{date}
   */
  const syncWaterIntake = useCallback(async (entry: { waterIntake: number, glassesConsumed: number, goal: number, date: string }) => {
    if (!enabled || !matricula) return;
    
    try {
      // Sincronizar com Firebase (usando save para sobrescrever o total do dia)
      await syncSave(matricula, `hydration/${entry.date}`, {
        ...entry,
        updatedAt: Date.now(),
      });
      console.log('[Sync] Hydration sync queued');
    } catch (error) {
      console.error('[Sync] Error syncing water intake:', error);
    }
  }, [matricula, enabled, syncSave]);

  /**
   * Sincronizar pressão arterial
   * Estrutura: canteiro-saudavel/employees/{matricula}/pressure/{timestamp}
   */
  const syncBloodPressure = useCallback(async (systolic: number, diastolic: number) => {
    if (!enabled || !matricula) return;
    
    try {
      const bpData = {
        systolic,
        diastolic,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
      };
      
      // Sincronizar com Firebase
      await syncSave(matricula, `pressure/${bpData.timestamp}`, bpData);
      console.log('[Sync] Blood pressure sync queued');
    } catch (error) {
      console.error('[Sync] Error syncing blood pressure:', error);
    }
  }, [matricula, enabled, syncSave]);

  /**
   * Sincronizar sintomas/queixas
   * Estrutura: canteiro-saudavel/employees/{matricula}/complaints/{timestamp}
   */
  const syncSymptoms = useCallback(async (symptoms: string[], details?: string) => {
    if (!enabled || !matricula) return;
    
    try {
      const symptomData = {
        symptoms,
        details,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
      };
      
      // Sincronizar com Firebase
      await syncSave(matricula, `complaints/${symptomData.timestamp}`, symptomData);
      console.log('[Sync] Symptoms sync queued');
    } catch (error) {
      console.error('[Sync] Error syncing symptoms:', error);
    }
  }, [matricula, enabled, syncSave]);

  /**
   * Sincronizar check-in diário
   * Estrutura: canteiro-saudavel/employees/{matricula}/checkins/{date}
   */
  const syncCheckIn = useCallback(async (status: string) => {
    if (!enabled || !matricula) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkinData = {
        status,
        timestamp: Date.now(),
        date: today,
      };
      
      // Sincronizar com Firebase
      await syncSave(matricula, `checkins/${today}`, checkinData);
      console.log('[Sync] Check-in sync queued');
    } catch (error) {
      console.error('[Sync] Error syncing check-in:', error);
    }
  }, [matricula, enabled, syncSave]);

  /**
   * Sincronizar token de push notification
   */
  const syncPushToken = useCallback(async (token: string) => {
    if (!enabled || !matricula) return;
    await syncSave(matricula, 'pushToken', { token, updatedAt: Date.now() });
  }, [matricula, enabled, syncSave]);

  return {
    syncProfile,
    syncWaterIntake,
    syncBloodPressure,
    syncSymptoms,
    syncCheckIn,
    syncPushToken
  };
}
