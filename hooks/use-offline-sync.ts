import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { saveToFirebase, pushToFirebase } from '@/lib/firebase';

const OFFLINE_QUEUE_KEY = 'offline_sync_queue';
const LAST_SYNC_KEY = 'last_sync_timestamp';

export interface QueueItem {
  id: string;
  matricula: string;
  type: 'save' | 'push';
  path: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean | null;
  isSyncing: boolean;
  pendingItems: number;
  lastSync: number | null;
  lastError: string | null;
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingItems: 0,
    lastSync: null,
    lastError: null,
  });

  // Monitorar estado da conexão
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !syncStatus.isOnline;
      const nowOnline = state.isConnected && state.isInternetReachable !== false;
      
      setSyncStatus(prev => ({ ...prev, isOnline: nowOnline }));
      
      // Se voltou a ficar online, processar fila
      if (wasOffline && nowOnline) {
        processQueue();
      }
    });

    // Carregar estado inicial
    loadInitialStatus();

    return () => unsubscribe();
  }, [syncStatus.isOnline]);

  const loadInitialStatus = async () => {
    try {
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
      
      const queue: QueueItem[] = queueStr ? JSON.parse(queueStr) : [];
      const lastSync = lastSyncStr ? parseInt(lastSyncStr) : null;
      
      setSyncStatus(prev => ({
        ...prev,
        pendingItems: queue.length,
        lastSync
      }));
    } catch (error) {
      console.error('[OfflineSync] Erro ao carregar status inicial:', error);
    }
  };

  /**
   * Adicionar item à fila offline
   */
  const addToQueue = useCallback(async (matricula: string, type: 'save' | 'push', path: string, data: any) => {
    try {
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: QueueItem[] = queueStr ? JSON.parse(queueStr) : [];
      
      const newItem: QueueItem = {
        id: Math.random().toString(36).substring(2, 15),
        matricula,
        type,
        path,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      queue.push(newItem);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      
      setSyncStatus(prev => ({
        ...prev,
        pendingItems: queue.length
      }));
      
      console.log(`[OfflineSync] Item adicionado à fila: ${path}`);
      
      // Tentar processar imediatamente se estiver online
      if (syncStatus.isOnline) {
        processQueue();
      }
    } catch (error) {
      console.error('[OfflineSync] Erro ao adicionar à fila:', error);
    }
  }, [syncStatus.isOnline]);

  /**
   * Processar fila de sincronização
   */
  const processQueue = useCallback(async () => {
    if (syncStatus.isSyncing || !syncStatus.isOnline) return;
    
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, lastError: null }));
      
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueStr) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      let queue: QueueItem[] = JSON.parse(queueStr);
      if (queue.length === 0) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      console.log(`[OfflineSync] Processando fila com ${queue.length} itens...`);
      
      const failedItems: QueueItem[] = [];
      
      for (const item of queue) {
        try {
          if (item.type === 'save') {
            await saveToFirebase(item.matricula, item.path, item.data);
          } else {
            await pushToFirebase(item.matricula, item.path, item.data);
          }
          console.log(`[OfflineSync] Item sincronizado: ${item.path}`);
        } catch (error) {
          console.error(`[OfflineSync] Falha ao sincronizar item ${item.id}:`, error);
          item.retryCount++;
          if (item.retryCount < 5) { // Tentar até 5 vezes
            failedItems.push(item);
          }
        }
      }

      // Atualizar fila com itens que falharam
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedItems));
      
      // Atualizar timestamp da última sincronização
      const now = Date.now();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingItems: failedItems.length,
        lastSync: now,
        lastError: failedItems.length > 0 ? `${failedItems.length} itens falharam` : null
      }));
      
      console.log(`[OfflineSync] Processamento concluído. Restantes: ${failedItems.length}`);
    } catch (error) {
      console.error('[OfflineSync] Erro ao processar fila:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false, lastError: 'Erro ao processar fila' }));
    }
  }, [syncStatus.isSyncing, syncStatus.isOnline]);

  /**
   * Função wrapper para saveToFirebase com suporte offline
   */
  const syncSave = useCallback(async (matricula: string, path: string, data: any) => {
    if (syncStatus.isOnline) {
      try {
        await saveToFirebase(matricula, path, data);
        return;
      } catch (error) {
        console.warn('[OfflineSync] Falha online, movendo para fila:', path);
      }
    }
    
    await addToQueue(matricula, 'save', path, data);
  }, [syncStatus.isOnline, addToQueue]);

  /**
   * Função wrapper para pushToFirebase com suporte offline
   */
  const syncPush = useCallback(async (matricula: string, path: string, data: any) => {
    if (syncStatus.isOnline) {
      try {
        await pushToFirebase(matricula, path, data);
        return;
      } catch (error) {
        console.warn('[OfflineSync] Falha online, movendo para fila:', path);
      }
    }
    
    await addToQueue(matricula, 'push', path, data);
  }, [syncStatus.isOnline, addToQueue]);

  return {
    syncStatus,
    syncSave,
    syncPush,
    processQueue,
  };
}
