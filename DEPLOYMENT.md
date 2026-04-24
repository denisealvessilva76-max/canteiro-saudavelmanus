# 🚀 Guia de Deployment - Canteiro Saudável

## Visão Geral

O **Canteiro Saudável** é um aplicativo React Native/Expo de saúde ocupacional para trabalhadores da construção civil. Este guia descreve como fazer o deployment da aplicação.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Canteiro Saudável                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Native/Expo (Mobile + Web)                   │  │
│  │  - Login & Cadastro                                 │  │
│  │  - Hidratação (copos visuais)                       │  │
│  │  - Desafios (upload de fotos)                       │  │
│  │  - Check-in diário                                  │  │
│  │  - Perfil & Evolução                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firebase Realtime Database                         │  │
│  │  - Sincronização offline-first                      │  │
│  │  - Fila de sincronização automática                 │  │
│  │  - Dados em tempo real                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Painel Administrativo (HTML + Firebase)            │  │
│  │  - Dashboard em tempo real                          │  │
│  │  - Gerenciamento de funcionários                    │  │
│  │  - Relatórios PDF                                   │  │
│  │  - Comunicados                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Requisitos

- Node.js 18+ e pnpm
- Git
- Conta Firebase (já configurada)
- Conta GitHub (para GitHub Pages)

## Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyB32S5Eac0guxy1herefub70AIAGkgF1Rw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=canteiro-saudavel.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://canteiro-saudavel-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=canteiro-saudavel
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=canteiro-saudavel.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=37768857073
EXPO_PUBLIC_FIREBASE_APP_ID=1:37768857073:web:3e62666713391869813050

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/canteiro_saudavel
```

## Desenvolvimento Local

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Iniciar servidor de desenvolvimento
```bash
pnpm dev
```

Isso inicia:
- **Metro bundler** (Expo) na porta 8081
- **Servidor Node.js** na porta 3000

### 3. Acessar o app
- **Web**: http://localhost:8081
- **Mobile**: Use o app Expo Go e scaneie o QR code

## Build para Produção

### 1. Build Web
```bash
pnpm build
```

Isso gera:
- `dist-web/` - App web compilado
- `dist/` - Servidor Node.js compilado

### 2. Testar build localmente
```bash
pnpm start
```

Acesse http://localhost:3000

## Deployment no GitHub Pages

### 1. Configurar repositório GitHub

```bash
# Adicionar remote (se não existir)
git remote add origin https://github.com/denisealvessilva76-max/canteiro-saudavelmanus.git

# Configurar branch padrão
git branch -M main
git push -u origin main
```

### 2. Ativar GitHub Pages

1. Vá para **Settings** → **Pages**
2. Selecione **Deploy from a branch**
3. Escolha branch **gh-pages** e pasta **/ (root)**
4. Clique em **Save**

### 3. Fazer deployment

```bash
# Opção 1: Usar script de deployment
./scripts/deploy-gh-pages.sh

# Opção 2: Manual
pnpm build
git add dist-web/ -f
git commit -m "chore: build web"
git push origin main
git subtree push --prefix dist-web origin gh-pages
```

### 4. Acessar o app

Após alguns minutos, o app estará disponível em:
```
https://denisealvessilva76-max.github.io/canteiro-saudavelmanus/
```

## Painel Administrativo

O painel administrativo está disponível em:
```
https://denisealvessilva76-max.github.io/canteiro-saudavelmanus/painel.html
```

### Credenciais de Admin
- **Email**: denisealvessilva76@gmail.com
- **Senha**: POTATO345

### Funcionalidades
- 📊 Dashboard com estatísticas em tempo real
- 👥 Gerenciamento de funcionários
- ❤️ Monitoramento de saúde
- 💧 Controle de hidratação
- 🏆 Acompanhamento de desafios
- 📄 Geração de relatórios PDF

## Estrutura de Dados Firebase

```
canteiro-saudavel/
├── employees/
│   ├── {matricula}/
│   │   ├── profile
│   │   │   ├── name
│   │   │   ├── matricula
│   │   │   ├── turno
│   │   │   ├── height
│   │   │   ├── weight
│   │   │   └── workType
│   │   ├── hydration/
│   │   │   └── {date}
│   │   │       ├── waterIntake
│   │   │       ├── glassesConsumed
│   │   │       └── goal
│   │   ├── checkins/
│   │   │   └── {date}
│   │   │       ├── status
│   │   │       └── timestamp
│   │   ├── pressure/
│   │   │   └── {timestamp}
│   │   │       ├── systolic
│   │   │       └── diastolic
│   │   ├── complaints/
│   │   │   └── {timestamp}
│   │   │       ├── symptoms
│   │   │       └── details
│   │   └── challenges/
│   │       └── {challengeId}
│   │           ├── status
│   │           ├── progress
│   │           └── photos
```

## Sincronização Offline-First

O app implementa sincronização offline-first com as seguintes características:

1. **Salvamento Local**: Todos os dados são salvos em AsyncStorage primeiro
2. **Fila de Sincronização**: Dados pendentes são armazenados em fila
3. **Sincronização Automática**: Quando online, a fila é processada automaticamente
4. **Retry Automático**: Até 5 tentativas de sincronização com backoff exponencial

### Monitoramento de Sincronização

```javascript
import { useOfflineSync } from '@/hooks/use-offline-sync';

function MyComponent() {
  const { syncStatus } = useOfflineSync();
  
  return (
    <View>
      <Text>Online: {syncStatus.isOnline ? '✅' : '❌'}</Text>
      <Text>Sincronizando: {syncStatus.isSyncing ? '⏳' : '✓'}</Text>
      <Text>Pendentes: {syncStatus.pendingItems}</Text>
    </View>
  );
}
```

## Troubleshooting

### App não conecta ao Firebase
1. Verifique as credenciais em `.env.local`
2. Verifique as regras de segurança do Firebase Realtime Database
3. Verifique a conexão de internet

### Painel administrativo não carrega dados
1. Verifique se está logado com as credenciais corretas
2. Verifique se há dados no Firebase Realtime Database
3. Verifique o console do navegador para erros

### Build falha com erros TypeScript
```bash
pnpm run check
```

### Servidor não inicia
```bash
# Limpar cache
rm -rf .turbo node_modules
pnpm install

# Tentar novamente
pnpm dev
```

## Monitoramento em Produção

### Logs do Firebase
- Acesse [Firebase Console](https://console.firebase.google.com)
- Projeto: `canteiro-saudavel`
- Veja dados em tempo real em **Realtime Database**

### Métricas de Saúde
- Número de usuários ativos
- Taxa de sincronização
- Erros de conexão
- Tempo de resposta

## Segurança

### Regras do Firebase Realtime Database

```json
{
  "rules": {
    "canteiro-saudavel": {
      "employees": {
        "$uid": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid",
          "profile": {
            ".validate": "newData.hasChildren(['name', 'matricula'])"
          }
        }
      }
    }
  }
}
```

### Proteção de Dados
- ✅ Dados salvos localmente com AsyncStorage
- ✅ Sincronização via HTTPS
- ✅ Autenticação por matrícula
- ✅ Validação de entrada no cliente e servidor

## Suporte

Para suporte, entre em contato:
- **Email**: denisealvessilva76@gmail.com
- **WhatsApp**: +55 21 99822-5493
- **GitHub Issues**: https://github.com/denisealvessilva76-max/canteiro-saudavelmanus/issues

---

**Última atualização**: Abril 2026
**Versão**: 1.0.29
