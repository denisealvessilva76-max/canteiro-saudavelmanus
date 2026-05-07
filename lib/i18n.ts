/**
 * Configuração de Internacionalização (i18n)
 * Suporta: Português (PT-BR), Inglês (EN), Espanhol (ES)
 */

export type Language = 'pt-BR' | 'en' | 'es';

export const translations = {
  'pt-BR': {
    // Navegação
    'nav.home': 'Home',
    'nav.ergonomia': 'Ergonomia',
    'nav.saude': 'Saúde',
    'nav.avisos': 'Avisos',
    'nav.perfil': 'Perfil',

    // Home
    'home.title': 'Bem-vindo!',
    'home.greeting': 'Olá, {name}!',
    'home.checkIn': 'Como você está?',
    'home.checkInWell': 'Tudo bem',
    'home.checkInMildPain': 'Dor leve',
    'home.checkInStrongPain': 'Dor forte',
    'home.sequence': 'Sequência',
    'home.points': 'Pontos',
    'home.level': 'Nível',
    'home.shortcuts': 'Atalhos Rápidos',
    'home.hydration': 'Hidratação',
    'home.pressure': 'Pressão',
    'home.ergonomics': 'Ergonomia',
    'home.challenges': 'Desafios',
    'home.weekSummary': 'Resumo da Semana',
    'home.tipOfDay': 'Dica do Dia',

    // Ergonomia
    'ergonomia.title': 'Ergonomia',
    'ergonomia.stretches': 'Alongamentos',
    'ergonomia.postures': 'Posturas',
    'ergonomia.breathing': 'Respiração',
    'ergonomia.duration': 'Duração',
    'ergonomia.benefit': 'Benefício',
    'ergonomia.watchVideo': 'Assistir Vídeo',

    // Saúde
    'saude.title': 'Saúde',
    'saude.hydration': 'Hidratação',
    'saude.pressure': 'Pressão',
    'saude.symptoms': 'Sintomas',
    'saude.cups': 'Copos',
    'saude.goal': 'Meta',
    'saude.systolic': 'Sistólica',
    'saude.diastolic': 'Diastólica',
    'saude.register': 'Registrar',
    'saude.history': 'Histórico',
    'saude.normal': 'Normal',
    'saude.elevated': 'Elevada',
    'saude.high': 'Alta',

    // Avisos
    'avisos.title': 'Avisos',
    'avisos.all': 'Todos',
    'avisos.urgent': 'Urgente',
    'avisos.informative': 'Informativo',
    'avisos.unread': 'Não lidos',

    // Perfil
    'perfil.title': 'Perfil',
    'perfil.name': 'Nome',
    'perfil.matricula': 'Matrícula',
    'perfil.cargo': 'Cargo',
    'perfil.weight': 'Peso',
    'perfil.height': 'Altura',
    'perfil.shift': 'Turno',
    'perfil.edit': 'Editar',
    'perfil.save': 'Salvar',
    'perfil.logout': 'Sair',
    'perfil.achievements': 'Conquistas',
    'perfil.nextLevel': 'Próximo Nível',

    // Saúde Mental
    'saudeMental.title': 'Saúde Mental',
    'saudeMental.contacts': 'Contatos',
    'saudeMental.mentalMap': 'Mapa Mental',
    'saudeMental.breathing': 'Respiração',
    'saudeMental.call': 'Ligar',
    'saudeMental.whatsapp': 'WhatsApp',
    'saudeMental.email': 'Email',

    // Desafios
    'desafios.title': 'Desafios',
    'desafios.active': 'Ativos',
    'desafios.completed': 'Completos',
    'desafios.uploadPhoto': 'Enviar Foto',
    'desafios.category': 'Categoria',
    'desafios.description': 'Descrição',
    'desafios.points': 'Pontos',

    // Recompensas
    'recompensas.title': 'Recompensas',
    'recompensas.available': 'Disponíveis',
    'recompensas.redeemed': 'Resgatados',
    'recompensas.redeem': 'Resgatar',
    'recompensas.insufficientPoints': 'Pontos insuficientes',

    // Autenticação
    'auth.onboarding': 'Bem-vindo ao Canteiro Saudável',
    'auth.register': 'Cadastro',
    'auth.login': 'Login',
    'auth.tutorial': 'Tutorial',
    'auth.startNow': 'Começar Agora',
    'auth.alreadyRegistered': 'Já tenho cadastro',
    'auth.enter': 'Entrar',
    'auth.back': 'Voltar',
    'auth.next': 'Próximo',
    'auth.finish': 'Concluir',

    // Mensagens
    'messages.success': 'Sucesso!',
    'messages.error': 'Erro',
    'messages.warning': 'Atenção',
    'messages.loading': 'Carregando...',
    'messages.confirm': 'Confirmar',
    'messages.cancel': 'Cancelar',
    'messages.delete': 'Deletar',
    'messages.edit': 'Editar',
    'messages.close': 'Fechar',
    'messages.saved': 'Salvo com sucesso!',
    'messages.deleted': 'Deletado com sucesso!',
    'messages.confirmLogout': 'Tem certeza que deseja sair?',

    // Configurações
    'settings.title': 'Configurações',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificações',
    'settings.lightMode': 'Modo Claro',
    'settings.darkMode': 'Modo Escuro',
    'settings.autoMode': 'Automático',
  },
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.ergonomia': 'Ergonomics',
    'nav.saude': 'Health',
    'nav.avisos': 'Alerts',
    'nav.perfil': 'Profile',

    // Home
    'home.title': 'Welcome!',
    'home.greeting': 'Hi, {name}!',
    'home.checkIn': 'How are you?',
    'home.checkInWell': 'Feeling well',
    'home.checkInMildPain': 'Mild pain',
    'home.checkInStrongPain': 'Strong pain',
    'home.sequence': 'Sequence',
    'home.points': 'Points',
    'home.level': 'Level',
    'home.shortcuts': 'Quick Shortcuts',
    'home.hydration': 'Hydration',
    'home.pressure': 'Pressure',
    'home.ergonomics': 'Ergonomics',
    'home.challenges': 'Challenges',
    'home.weekSummary': 'Weekly Summary',
    'home.tipOfDay': 'Tip of the Day',

    // Ergonomics
    'ergonomia.title': 'Ergonomics',
    'ergonomia.stretches': 'Stretches',
    'ergonomia.postures': 'Postures',
    'ergonomia.breathing': 'Breathing',
    'ergonomia.duration': 'Duration',
    'ergonomia.benefit': 'Benefit',
    'ergonomia.watchVideo': 'Watch Video',

    // Health
    'saude.title': 'Health',
    'saude.hydration': 'Hydration',
    'saude.pressure': 'Pressure',
    'saude.symptoms': 'Symptoms',
    'saude.cups': 'Cups',
    'saude.goal': 'Goal',
    'saude.systolic': 'Systolic',
    'saude.diastolic': 'Diastolic',
    'saude.register': 'Register',
    'saude.history': 'History',
    'saude.normal': 'Normal',
    'saude.elevated': 'Elevated',
    'saude.high': 'High',

    // Alerts
    'avisos.title': 'Alerts',
    'avisos.all': 'All',
    'avisos.urgent': 'Urgent',
    'avisos.informative': 'Informative',
    'avisos.unread': 'Unread',

    // Profile
    'perfil.title': 'Profile',
    'perfil.name': 'Name',
    'perfil.matricula': 'Employee ID',
    'perfil.cargo': 'Position',
    'perfil.weight': 'Weight',
    'perfil.height': 'Height',
    'perfil.shift': 'Shift',
    'perfil.edit': 'Edit',
    'perfil.save': 'Save',
    'perfil.logout': 'Sign Out',
    'perfil.achievements': 'Achievements',
    'perfil.nextLevel': 'Next Level',

    // Mental Health
    'saudeMental.title': 'Mental Health',
    'saudeMental.contacts': 'Contacts',
    'saudeMental.mentalMap': 'Mental Map',
    'saudeMental.breathing': 'Breathing',
    'saudeMental.call': 'Call',
    'saudeMental.whatsapp': 'WhatsApp',
    'saudeMental.email': 'Email',

    // Challenges
    'desafios.title': 'Challenges',
    'desafios.active': 'Active',
    'desafios.completed': 'Completed',
    'desafios.uploadPhoto': 'Upload Photo',
    'desafios.category': 'Category',
    'desafios.description': 'Description',
    'desafios.points': 'Points',

    // Rewards
    'recompensas.title': 'Rewards',
    'recompensas.available': 'Available',
    'recompensas.redeemed': 'Redeemed',
    'recompensas.redeem': 'Redeem',
    'recompensas.insufficientPoints': 'Insufficient points',

    // Authentication
    'auth.onboarding': 'Welcome to Healthy Construction Site',
    'auth.register': 'Register',
    'auth.login': 'Login',
    'auth.tutorial': 'Tutorial',
    'auth.startNow': 'Start Now',
    'auth.alreadyRegistered': 'Already registered',
    'auth.enter': 'Enter',
    'auth.back': 'Back',
    'auth.next': 'Next',
    'auth.finish': 'Finish',

    // Messages
    'messages.success': 'Success!',
    'messages.error': 'Error',
    'messages.warning': 'Warning',
    'messages.loading': 'Loading...',
    'messages.confirm': 'Confirm',
    'messages.cancel': 'Cancel',
    'messages.delete': 'Delete',
    'messages.edit': 'Edit',
    'messages.close': 'Close',
    'messages.saved': 'Saved successfully!',
    'messages.deleted': 'Deleted successfully!',
    'messages.confirmLogout': 'Are you sure you want to sign out?',

    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.lightMode': 'Light Mode',
    'settings.darkMode': 'Dark Mode',
    'settings.autoMode': 'Auto',
  },
  'es': {
    // Navegación
    'nav.home': 'Inicio',
    'nav.ergonomia': 'Ergonomía',
    'nav.saude': 'Salud',
    'nav.avisos': 'Alertas',
    'nav.perfil': 'Perfil',

    // Inicio
    'home.title': '¡Bienvenido!',
    'home.greeting': '¡Hola, {name}!',
    'home.checkIn': '¿Cómo te sientes?',
    'home.checkInWell': 'Bien',
    'home.checkInMildPain': 'Dolor leve',
    'home.checkInStrongPain': 'Dolor fuerte',
    'home.sequence': 'Secuencia',
    'home.points': 'Puntos',
    'home.level': 'Nivel',
    'home.shortcuts': 'Accesos Rápidos',
    'home.hydration': 'Hidratación',
    'home.pressure': 'Presión',
    'home.ergonomics': 'Ergonomía',
    'home.challenges': 'Desafíos',
    'home.weekSummary': 'Resumen Semanal',
    'home.tipOfDay': 'Consejo del Día',

    // Ergonomía
    'ergonomia.title': 'Ergonomía',
    'ergonomia.stretches': 'Estiramientos',
    'ergonomia.postures': 'Posturas',
    'ergonomia.breathing': 'Respiración',
    'ergonomia.duration': 'Duración',
    'ergonomia.benefit': 'Beneficio',
    'ergonomia.watchVideo': 'Ver Video',

    // Salud
    'saude.title': 'Salud',
    'saude.hydration': 'Hidratación',
    'saude.pressure': 'Presión',
    'saude.symptoms': 'Síntomas',
    'saude.cups': 'Vasos',
    'saude.goal': 'Meta',
    'saude.systolic': 'Sistólica',
    'saude.diastolic': 'Diastólica',
    'saude.register': 'Registrar',
    'saude.history': 'Historial',
    'saude.normal': 'Normal',
    'saude.elevated': 'Elevada',
    'saude.high': 'Alta',

    // Alertas
    'avisos.title': 'Alertas',
    'avisos.all': 'Todos',
    'avisos.urgent': 'Urgente',
    'avisos.informative': 'Informativo',
    'avisos.unread': 'No leídos',

    // Perfil
    'perfil.title': 'Perfil',
    'perfil.name': 'Nombre',
    'perfil.matricula': 'Matrícula',
    'perfil.cargo': 'Cargo',
    'perfil.weight': 'Peso',
    'perfil.height': 'Altura',
    'perfil.shift': 'Turno',
    'perfil.edit': 'Editar',
    'perfil.save': 'Guardar',
    'perfil.logout': 'Salir',
    'perfil.achievements': 'Logros',
    'perfil.nextLevel': 'Próximo Nivel',

    // Salud Mental
    'saudeMental.title': 'Salud Mental',
    'saudeMental.contacts': 'Contactos',
    'saudeMental.mentalMap': 'Mapa Mental',
    'saudeMental.breathing': 'Respiración',
    'saudeMental.call': 'Llamar',
    'saudeMental.whatsapp': 'WhatsApp',
    'saudeMental.email': 'Correo',

    // Desafíos
    'desafios.title': 'Desafíos',
    'desafios.active': 'Activos',
    'desafios.completed': 'Completados',
    'desafios.uploadPhoto': 'Subir Foto',
    'desafios.category': 'Categoría',
    'desafios.description': 'Descripción',
    'desafios.points': 'Puntos',

    // Recompensas
    'recompensas.title': 'Recompensas',
    'recompensas.available': 'Disponibles',
    'recompensas.redeemed': 'Canjeadas',
    'recompensas.redeem': 'Canjear',
    'recompensas.insufficientPoints': 'Puntos insuficientes',

    // Autenticación
    'auth.onboarding': 'Bienvenido a Cantero Saludable',
    'auth.register': 'Registro',
    'auth.login': 'Iniciar Sesión',
    'auth.tutorial': 'Tutorial',
    'auth.startNow': 'Comenzar Ahora',
    'auth.alreadyRegistered': 'Ya estoy registrado',
    'auth.enter': 'Entrar',
    'auth.back': 'Atrás',
    'auth.next': 'Siguiente',
    'auth.finish': 'Finalizar',

    // Mensajes
    'messages.success': '¡Éxito!',
    'messages.error': 'Error',
    'messages.warning': 'Advertencia',
    'messages.loading': 'Cargando...',
    'messages.confirm': 'Confirmar',
    'messages.cancel': 'Cancelar',
    'messages.delete': 'Eliminar',
    'messages.edit': 'Editar',
    'messages.close': 'Cerrar',
    'messages.saved': '¡Guardado exitosamente!',
    'messages.deleted': '¡Eliminado exitosamente!',
    'messages.confirmLogout': '¿Estás seguro de que deseas cerrar sesión?',

    // Configuración
    'settings.title': 'Configuración',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.lightMode': 'Modo Claro',
    'settings.darkMode': 'Modo Oscuro',
    'settings.autoMode': 'Automático',
  },
};

export function t(key: string, language: Language = 'pt-BR', params?: Record<string, string>): string {
  const translationObj = translations[language];
  let translation = (translationObj as any)[key] || key;

  // Substituir parâmetros
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translation = translation.replace(`{${paramKey}}`, paramValue);
    });
  }

  return translation;
}

export function useTranslation(language: Language = 'pt-BR') {
  return (key: string, params?: Record<string, string>) => {
    return t(key, language, params);
  };
}
