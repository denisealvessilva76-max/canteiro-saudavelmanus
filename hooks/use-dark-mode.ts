import { useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorScheme = 'light' | 'dark' | 'auto';

export function useDarkMode() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>('auto');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar preferência de tema salva
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Atualizar isDarkMode quando colorScheme mudar
  useEffect(() => {
    const effectiveScheme = colorScheme === 'auto' ? systemColorScheme : colorScheme;
    setIsDarkMode(effectiveScheme === 'dark');
  }, [colorScheme, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme:preference');
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        setColorScheme(saved as ColorScheme);
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  const setTheme = useCallback(async (scheme: ColorScheme) => {
    try {
      setColorScheme(scheme);
      await AsyncStorage.setItem('theme:preference', scheme);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newScheme = isDarkMode ? 'light' : 'dark';
    await setTheme(newScheme);
  }, [isDarkMode, setTheme]);

  return {
    colorScheme,
    isDarkMode,
    setTheme,
    toggleDarkMode,
  };
}
