/**
 * Paletas de cores para modo claro e escuro
 * Baseadas na identidade visual verde profissional
 */

export const lightTheme = {
  // Cores primárias
  primary: '#1B8A4C', // Verde escuro
  primaryLight: '#27AE60', // Verde médio
  primaryLighter: '#52C77E', // Verde claro
  
  // Cores de fundo
  background: '#FFFFFF', // Branco
  surface: '#F5F5F5', // Cinza muito claro
  surfaceAlt: '#EEEEEE', // Cinza claro
  
  // Cores de texto
  foreground: '#11181C', // Preto quase puro
  muted: '#687076', // Cinza médio
  mutedLight: '#9BA1A6', // Cinza claro
  
  // Cores de borda
  border: '#E5E7EB', // Cinza claro
  borderLight: '#F0F0F0', // Cinza muito claro
  
  // Cores de estado
  success: '#22C55E', // Verde
  successLight: '#86EFAC', // Verde claro
  warning: '#F59E0B', // Amarelo
  warningLight: '#FCD34D', // Amarelo claro
  error: '#EF4444', // Vermelho
  errorLight: '#FCA5A5', // Vermelho claro
  info: '#3B82F6', // Azul
  infoLight: '#93C5FD', // Azul claro
  
  // Cores especiais
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
};

export const darkTheme = {
  // Cores primárias
  primary: '#27AE60', // Verde médio (mais brilhante em dark mode)
  primaryLight: '#52C77E', // Verde claro
  primaryLighter: '#86EFAC', // Verde muito claro
  
  // Cores de fundo
  background: '#0F1419', // Preto muito escuro
  surface: '#1A1F26', // Cinza muito escuro
  surfaceAlt: '#252D36', // Cinza escuro
  
  // Cores de texto
  foreground: '#ECEDEE', // Branco quase puro
  muted: '#9BA1A6', // Cinza médio
  mutedLight: '#687076', // Cinza claro
  
  // Cores de borda
  border: '#334155', // Cinza escuro
  borderLight: '#475569', // Cinza médio-escuro
  
  // Cores de estado
  success: '#4ADE80', // Verde brilhante
  successLight: '#86EFAC', // Verde claro
  warning: '#FBBF24', // Amarelo brilhante
  warningLight: '#FCD34D', // Amarelo claro
  error: '#F87171', // Vermelho brilhante
  errorLight: '#FCA5A5', // Vermelho claro
  info: '#60A5FA', // Azul brilhante
  infoLight: '#93C5FD', // Azul claro
  
  // Cores especiais
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
};

export type Theme = typeof lightTheme;

export function getTheme(isDarkMode: boolean): Theme {
  return isDarkMode ? darkTheme : lightTheme;
}
