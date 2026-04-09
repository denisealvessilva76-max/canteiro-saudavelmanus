# 🌱 Canteiro Saudável - Guia de Deployment e Acesso

## 📱 App Mobile (React Native + Expo)

### Acesso Local (Desenvolvimento)
```
URL: https://8081-iandni90w1eugq944yddc-d78f1843.us1.manus.computer
Status: ✅ Rodando
```

**Funcionalidades Implementadas:**
- ✅ Tela de Cadastro com Turno (Diurno/Noturno)
- ✅ Tela de Login
- ✅ Home com Check-in Diário
- ✅ Abas: Home, Ergonomia, Saúde, Avisos, Perfil
- ✅ Integração Firebase Realtime Database
- ✅ Gráficos de Hidratação e Saúde

### Deploy para APK/iOS
1. Clique em **"Publicar"** na interface Manus
2. Selecione **"Gerar APK"** (Android) ou **"Build iOS"**
3. Aguarde 10-15 minutos
4. Baixe o arquivo gerado

---

## 🖥️ Painel Administrativo

### Acesso Local (Desenvolvimento)
```
URL: file:///home/ubuntu/canteiro-saudavel/painel-funcional.html
Credenciais: admin@canteiro.com / admin123
Status: ✅ Funcionando
```

### Acesso via GitHub Pages (Produção)
```
URL: https://denisealvessilva76-max.github.io/canteiro-saudavelmanus/painel-funcional.html
Credenciais: admin@canteiro.com / admin123
Status: ⏳ Aguardando atualização GitHub Pages (5-10 min)
```

**Funcionalidades Implementadas:**
- ✅ Autenticação (login/senha)
- ✅ Dashboard com Estatísticas
- ✅ Aba de Prêmios (adicionar, deletar)
- ✅ Aba de Notícias (publicar, deletar)
- ✅ Dados salvos em localStorage
- ✅ Interface responsiva

---

## 🔧 Tecnologias Utilizadas

### App Mobile
- **Framework:** React Native 0.81.5 + Expo SDK 54
- **Roteamento:** Expo Router 6
- **Styling:** NativeWind 4 (Tailwind CSS)
- **Banco de Dados:** Firebase Realtime Database
- **Armazenamento:** Firebase Storage
- **Autenticação:** Firebase Auth

### Painel Admin
- **Linguagem:** HTML5 + CSS3 + JavaScript (Vanilla)
- **Banco de Dados:** Firebase Realtime Database (localStorage como fallback)
- **Hospedagem:** GitHub Pages

---

## 📊 Estrutura de Dados (Firebase Realtime Database)

```
canteiro-saudavel/
├── usuarios/
│   ├── user_id/
│   │   ├── nome: string
│   │   ├── matricula: string
│   │   ├── turno: "Diurno" | "Noturno"
│   │   ├── altura: number
│   │   ├── peso: number
│   │   ├── funcao: string
│   │   └── data_cadastro: timestamp
│
├── saude/
│   ├── user_id/
│   │   ├── pressao: { sistolica, diastolica }
│   │   ├── dor: { nivel, localizacao, descricao }
│   │   └── data: timestamp
│
├── hidratacao/
│   ├── user_id/
│   │   ├── copos_bebidos: number
│   │   └── data: timestamp
│
├── premios/
│   ├── premio_id/
│   │   ├── nome: string
│   │   ├── pontos: number
│   │   ├── descricao: string
│   │   └── data_criacao: timestamp
│
└── noticias/
    ├── noticia_id/
    │   ├── titulo: string
    │   ├── conteudo: string
    │   ├── data_publicacao: timestamp
    │   └── autor: string
```

---

## 🚀 Próximos Passos Recomendados

### 1. **Integração Realtime do Painel Admin**
- Conectar painel-funcional.html ao Firebase Realtime Database
- Sincronização automática de dados em tempo real
- Remover dependência de localStorage

### 2. **Notificações Push**
- Implementar Firebase Cloud Messaging
- Notificar funcionários quando admin publica notícias/prêmios
- Lembretes diários de check-in

### 3. **Gráficos de Evolução**
- Dashboard admin com charts de hidratação mensal
- Gráficos de pressão arterial ao longo do tempo
- Comparativos por turno (Diurno vs Noturno)

### 4. **Relatórios PDF**
- Exportar dados de funcionários em PDF
- Gráficos e estatísticas para apresentação ao SESMT
- Envio automático por email

### 5. **Autenticação Segura**
- Implementar Firebase Auth no painel admin
- Remover credenciais hardcoded
- Adicionar controle de acesso por perfil

---

## 🔐 Credenciais Firebase

```javascript
// Configuração Firebase (já implementada)
const firebaseConfig = {
  apiKey: "AIzaSyB32S5Eac0guxy1herefub70AIAGkgF1Rw",
  authDomain: "canteiro-saudavel.firebaseapp.com",
  databaseURL: "https://canteiro-saudavel-default-rtdb.firebaseio.com",
  projectId: "canteiro-saudavel",
  storageBucket: "canteiro-saudavel.firebasestorage.app",
  messagingSenderId: "37768857073",
  appId: "1:37768857073:web:3e62666713391869813050"
};
```

---

## 📞 Suporte e Troubleshooting

### App não carrega
1. Verifique conexão com internet
2. Limpe cache do navegador (Ctrl+Shift+Delete)
3. Reinicie o dev server: `pnpm dev`

### Painel admin não sincroniza
1. Verifique se Firestore/Realtime Database está ativo
2. Verifique regras de segurança do Firebase
3. Abra console do navegador (F12) para ver erros

### Dados não aparecem no painel
1. Verifique se dados estão sendo salvos no Firebase
2. Verifique estrutura de dados (deve estar em `usuarios/`, `saude/`, etc)
3. Sincronize manualmente: F5 no navegador

---

## 📝 Notas Importantes

- ⚠️ **Painel Admin:** Atualmente usa localStorage (dados locais). Para sincronização em tempo real, conectar ao Firebase Realtime Database.
- ⚠️ **Segurança:** Credenciais Firebase estão expostas no código. Para produção, usar variáveis de ambiente.
- ⚠️ **GitHub Pages:** Leva 5-10 minutos para atualizar após push. Use cache busting se necessário.

---

**Última atualização:** 09/04/2026  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Deploy
