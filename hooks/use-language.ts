import { useEffect, useState, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, useTranslation } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslation(language);

  // Obter idioma do sistema
  const getSystemLanguage = useCallback((): Language => {
    try {
      if (Platform.OS === 'ios') {
        const locale = NativeModules.SettingsManager?.settings?.AppleLocale || 'pt-BR';
        if (locale.startsWith('en')) return 'en';
        if (locale.startsWith('es')) return 'es';
      } else if (Platform.OS === 'android') {
        const locale = NativeModules.I18nManager?.localeIdentifier || 'pt-BR';
        if (locale.startsWith('en')) return 'en';
        if (locale.startsWith('es')) return 'es';
      }
    } catch (error) {
      console.error('Erro ao obter idioma do sistema:', error);
    }
    return 'pt-BR';
  }, []);

  // Carregar idioma salvo ou usar padrão do sistema
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('language:preference');
      if (saved && (saved === 'pt-BR' || saved === 'en' || saved === 'es')) {
        setLanguage(saved as Language);
      } else {
        const systemLanguage = getSystemLanguage();
        setLanguage(systemLanguage);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
      const systemLanguage = getSystemLanguage();
      setLanguage(systemLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguagePreference = useCallback(async (newLanguage: Language) => {
    try {
      setLanguage(newLanguage);
      await AsyncStorage.setItem('language:preference', newLanguage);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  }, []);

  return {
    language,
    setLanguage: setLanguagePreference,
    t,
    isLoading,
  };
}
