import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFirebaseSync } from './use-firebase-sync';

interface NotificationConfig {
  checkInTime?: string; // HH:mm (default: 08:00)
  hydrationInterval?: number; // minutes (default: 120)
  stretchingTime?: string; // HH:mm (default: 12:00)
  enableCheckIn?: boolean;
  enableHydration?: boolean;
  enableStretching?: boolean;
  enableAnnouncements?: boolean;
}

const DEFAULT_CONFIG: NotificationConfig = {
  checkInTime: '08:00',
  hydrationInterval: 120,
  stretchingTime: '12:00',
  enableCheckIn: true,
  enableHydration: true,
  enableStretching: true,
  enableAnnouncements: true,
};

export function useNotificationScheduler() {
  const notificationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hydrationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeNotificationScheduler();
    return () => {
      if (notificationRef.current) {
        clearInterval(notificationRef.current);
      }
      if (hydrationTimerRef.current) {
        clearInterval(hydrationTimerRef.current);
      }
    };
  }, []);

  const initializeNotificationScheduler = async () => {
    try {
      const config = await loadNotificationConfig();
      
      // Agendar check-in diário
      if (config.enableCheckIn) {
        scheduleCheckInReminder(config.checkInTime!);
      }

      // Agendar hidratação periódica
      if (config.enableHydration) {
        scheduleHydrationReminders(config.hydrationInterval!);
      }

      // Agendar alongamento diário
      if (config.enableStretching) {
        scheduleStretchingReminder(config.stretchingTime!);
      }

      // Monitorar comunicados novos
      if (config.enableAnnouncements) {
        monitorAnnouncementsForNotifications();
      }
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao inicializar:', error);
    }
  };

  const loadNotificationConfig = async (): Promise<NotificationConfig> => {
    try {
      const stored = await AsyncStorage.getItem('notification:config');
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao carregar config:', error);
      return DEFAULT_CONFIG;
    }
  };

  const scheduleCheckInReminder = async (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0);

      // Se já passou a hora, agendar para amanhã
      if (scheduledTime < now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Check-in Diário',
          body: 'Não esqueça de fazer seu check-in de saúde hoje!',
          sound: true,
          priority: 'high',
        },
        trigger,
      });

      console.log('[NotificationScheduler] Check-in agendado para', time);
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao agendar check-in:', error);
    }
  };

  const scheduleHydrationReminders = async (intervalMinutes: number) => {
    try {
      // Cancelar timer anterior se existir
      if (hydrationTimerRef.current) {
        clearInterval(hydrationTimerRef.current);
      }

      // Agendar primeiro lembrete em 1 hora
      let nextReminderTime = 60 * 60 * 1000; // 1 hora em ms

      hydrationTimerRef.current = setInterval(async () => {
        try {
          const matricula = await AsyncStorage.getItem('employee:matricula');
          const lastHydrationReminder = await AsyncStorage.getItem('notification:last_hydration');
          const now = Date.now();

          // Verificar se já foi notificado hoje
          if (lastHydrationReminder) {
            const lastTime = parseInt(lastHydrationReminder);
            const hoursSinceLastReminder = (now - lastTime) / (1000 * 60 * 60);
            
            if (hoursSinceLastReminder < intervalMinutes / 60) {
              return; // Ainda não é hora
            }
          }

          // Enviar notificação
          const trigger: Notifications.TimeIntervalTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
          };

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💧 Hora de Beber Água!',
              body: 'Lembre-se de manter-se hidratado. Beba um copo de água agora!',
              sound: true,
              priority: 'high',
            },
            trigger,
          });

          // Salvar timestamp do último lembrete
          await AsyncStorage.setItem('notification:last_hydration', now.toString());

          console.log('[NotificationScheduler] Lembrete de hidratação enviado');
        } catch (error) {
          console.error('[NotificationScheduler] Erro ao enviar lembrete de hidratação:', error);
        }
      }, intervalMinutes * 60 * 1000);

      console.log('[NotificationScheduler] Hidratação agendada a cada', intervalMinutes, 'minutos');
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao agendar hidratação:', error);
    }
  };

  const scheduleStretchingReminder = async (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧘 Pausa Ativa - Alongamento',
          body: 'Que tal fazer alguns alongamentos? Sua saúde agradece!',
          sound: true,
          priority: 'high',
        },
        trigger,
      });

      console.log('[NotificationScheduler] Alongamento agendado para', time);
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao agendar alongamento:', error);
    }
  };

  const monitorAnnouncementsForNotifications = async () => {
    try {
      // Verificar a cada 5 minutos se há novos comunicados
      notificationRef.current = setInterval(async () => {
        try {
          const lastAnnouncementCheck = await AsyncStorage.getItem('notification:last_announcement_check');
          const now = Date.now();

          // Verificar apenas a cada 5 minutos
          if (lastAnnouncementCheck) {
            const lastCheck = parseInt(lastAnnouncementCheck);
            if (now - lastCheck < 5 * 60 * 1000) {
              return;
            }
          }

          // Aqui você pode integrar com Firebase para verificar novos comunicados
          // Por enquanto, apenas salvamos o timestamp
          await AsyncStorage.setItem('notification:last_announcement_check', now.toString());
        } catch (error) {
          console.error('[NotificationScheduler] Erro ao monitorar avisos:', error);
        }
      }, 60 * 1000); // Verificar a cada minuto

      console.log('[NotificationScheduler] Monitoramento de avisos ativado');
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao configurar monitoramento:', error);
    }
  };

  const sendAnnouncementNotification = async (title: string, body: string) => {
    try {
      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: 'high',
        },
        trigger,
      });

      console.log('[NotificationScheduler] Notificação de aviso enviada:', title);
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao enviar notificação de aviso:', error);
    }
  };

  const updateNotificationConfig = async (newConfig: Partial<NotificationConfig>) => {
    try {
      const current = await loadNotificationConfig();
      const updated = { ...current, ...newConfig };
      await AsyncStorage.setItem('notification:config', JSON.stringify(updated));
      
      // Reinicializar agendador com nova configuração
      initializeNotificationScheduler();
      
      console.log('[NotificationScheduler] Configuração atualizada:', updated);
    } catch (error) {
      console.error('[NotificationScheduler] Erro ao atualizar config:', error);
    }
  };

  return {
    sendAnnouncementNotification,
    updateNotificationConfig,
  };
}
