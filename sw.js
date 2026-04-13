// Service Worker para Canteiro Saudável
// Versão: 2.0.0 - Melhorado com Cache First + Network First

const CACHE_NAME = 'canteiro-saudavel-v2';
const OFFLINE_URL = '/canteiro-saudavelmanus/offline.html';

const ASSETS_TO_CACHE = [
  '/canteiro-saudavelmanus/',
  '/canteiro-saudavelmanus/index.html',
  '/canteiro-saudavelmanus/app.html',
  '/canteiro-saudavelmanus/admin.html',
  '/canteiro-saudavelmanus/health-check.html',
  '/canteiro-saudavelmanus/homepage.html',
  '/canteiro-saudavelmanus/firebase-config.js',
  '/canteiro-saudavelmanus/manifest.json',
  '/canteiro-saudavelmanus/offline.html'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cacheando assets principais...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('⚠️ Alguns assets não puderam ser cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de outros domínios (Firebase, CDN, etc)
  if (url.origin !== location.origin) {
    return;
  }

  // Estratégia: Network First para dados, Cache First para assets
  if (request.method === 'GET') {
    if (isDataRequest(url)) {
      // Network First para dados do Firebase
      event.respondWith(networkFirst(request));
    } else {
      // Cache First para assets estáticos
      event.respondWith(cacheFirst(request));
    }
  }
});

// Cache First: tenta cache primeiro, depois rede
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('❌ Fetch falhou:', error);
    return caches.match(OFFLINE_URL);
  }
}

// Network First: tenta rede primeiro, depois cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('⚠️ Rede indisponível, usando cache');
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match(OFFLINE_URL);
  }
}

// Verificar se é requisição de dados
function isDataRequest(url) {
  return url.pathname.includes('/api/') || 
         url.hostname.includes('firebase') ||
         url.hostname.includes('firebaseio');
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronização em background:', event.tag);
  if (event.tag === 'sync-health-data') {
    event.waitUntil(syncHealthData());
  }
});

// Função para sincronizar dados de saúde
async function syncHealthData() {
  try {
    console.log('📤 Sincronizando dados de saúde...');
    // TODO: Implementar sincronização com Firebase
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
  }
}

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('📢 Push recebido');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Canteiro Saudável';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/canteiro-saudavelmanus/icon-192.png',
    badge: '/canteiro-saudavelmanus/icon-96.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/canteiro-saudavelmanus/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('🚀 Service Worker v2.0.0 carregado');
