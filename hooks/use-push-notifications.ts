import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken?: string;
  notification?: Notifications.Notification;
  isLoading: boolean;
  error?: string;
}

export interface NotificationPreferences {
  enableCheckIn: boolean;
  enableHydration: boolean;
  enablePressureAlerts: boolean;
  enableMedalNotifications: boolean;
  enableChallengeReminders: boolean;
  checkInTime: string; // HH:mm
  hydrationInterval: number; // minutes
  pressureAlertThreshold: number; // systolic
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableCheckIn: true,
  enableHydration: true,
  enablePressureAlerts: true,
  enableMedalNotifications: true,
  enableChallengeReminders: true,
  checkInTime: '08:00',
  hydrationInterval: 120, // 2 hours
  pressureAlertThreshold: 140, // systolic
};

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const hydrationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        setExpoPushToken(token);
        if (token) {
          saveTokenLocally(token);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Listener para notificações recebidas
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener para quando usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notificação tocada:", response);
      // Aqui você pode navegar para telas específicas baseado no data da notificação
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const saveTokenLocally = async (token: string) => {
    try {
      await AsyncStorage.setItem("expo_push_token", token);
      console.log("[PushNotifications] Token salvo localmente:", token);
    } catch (error) {
      console.error("Erro ao salvar push token:", error);
    }
  };

  // Carregar preferências de notificação
  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('notification:preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        setPreferences(prefs);
        return prefs;
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return DEFAULT_PREFERENCES;
    }
  };

  // Salvar preferências de notificação
  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(
        'notification:preferences',
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  // Enviar notificação de pressão elevada
  const sendPressureAlert = async (systolic: number, diastolic: number) => {
    try {
      if (!preferences.enablePressureAlerts) return;

      if (systolic >= preferences.pressureAlertThreshold) {
        await scheduleLocalNotification(
          '⚠️ Pressão Elevada!',
          `Sua pressão está em ${systolic}/${diastolic}. Procure um profissional de saúde.`,
          { type: 'timeInterval', seconds: 1 } as any
        );

        // Registrar alerta em AsyncStorage
        await AsyncStorage.setItem(
          'notification:last_pressure_alert',
          new Date().toISOString()
        );
      }
    } catch (error) {
      console.error('Erro ao enviar alerta de pressão:', error);
    }
  };

  // Enviar notificação de medalha desbloqueada
  const sendMedalNotification = async (medalName: string, description: string) => {
    try {
      if (!preferences.enableMedalNotifications) return;

      await scheduleLocalNotification(
        '🏆 Medalha Desbloqueada!',
        `${medalName}: ${description}`,
        { type: 'timeInterval', seconds: 1 } as any
      );
    } catch (error) {
      console.error('Erro ao enviar notificação de medalha:', error);
    }
  };

  // Enviar lembrete de desafio
  const sendChallengeReminder = async (challengeName: string) => {
    try {
      if (!preferences.enableChallengeReminders) return;

      await scheduleLocalNotification(
        '🎯 Desafio Ativo!',
        `Não esqueça: ${challengeName}. Você consegue!`,
        { type: 'timeInterval', seconds: 1 } as any
      );
    } catch (error) {
      console.error('Erro ao enviar lembrete de desafio:', error);
    }
  };

  // Agendar notificações recorrentes
  const scheduleRecurringNotifications = async () => {
    try {
      const prefs = await loadPreferences();

      // Agendar hidratação recorrente
      if (prefs.enableHydration) {
        if (hydrationTimerRef.current) {
          clearInterval(hydrationTimerRef.current);
        }

        hydrationTimerRef.current = setInterval(async () => {
          const messages = [
            '💧 Beba água! Mantenha-se hidratado.',
            '🥤 Que tal um copo de água agora?',
            '💦 Não esqueça de beber água!',
            '🌊 Hidratação é saúde. Beba água!',
          ];

          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          await scheduleLocalNotification(
            '💧 Lembrete de Hidratação',
            randomMessage,
            { type: 'timeInterval', seconds: 1 } as any
          );
        }, prefs.hydrationInterval * 60 * 1000);
      }
    } catch (error) {
      console.error('Erro ao agendar notificações recorrentes:', error);
    }
  };

  // Limpar ao desmontar
  useEffect(() => {
    loadPreferences();
    scheduleRecurringNotifications();

    return () => {
      if (hydrationTimerRef.current) {
        clearInterval(hydrationTimerRef.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    isLoading,
    error,
    preferences,
    loadPreferences,
    savePreferences,
    sendPressureAlert,
    sendMedalNotification,
    sendChallengeReminder,
    scheduleRecurringNotifications,
  };
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Permissão de notificação negada");
    }

    // Obter token do Expo
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({});
      token = tokenData.data;
    } catch (error) {
      console.error("Erro ao obter push token:", error);
      throw error;
    }

    console.log("Expo Push Token:", token);
  } else {
    console.warn("Notificações push só funcionam em dispositivos físicos");
  }

  return token;
}

/**
 * Agendar notificação local
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.error("Erro ao agendar notificação:", error);
    throw error;
  }
}

/**
 * Cancelar notificação agendada
 */
export async function cancelScheduledNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Erro ao cancelar notificação:", error);
  }
}

/**
 * Cancelar todas as notificações agendadas
 */
export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Erro ao cancelar todas as notificações:", error);
  }
}

/**
 * Obter todas as notificações agendadas
 */
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Erro ao obter notificações agendadas:", error);
    return [];
  }
}
