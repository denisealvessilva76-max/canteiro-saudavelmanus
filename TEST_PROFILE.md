# Perfil de Teste - Canteiro Saudável

## Dados de Teste para Validação Completa

### 👤 Perfil de Teste

```json
{
  "matricula": "TEST-2026-001",
  "nome": "João Silva Teste",
  "email": "joao.teste@canteiro.com",
  "senha": "Teste@123",
  "cargo": "Pedreiro",
  "peso": 82,
  "altura": 175,
  "turno": "Diurno",
  "avatar": "👨",
  "dataNascimento": "1990-05-15"
}
```

### 📊 Dados de Teste para Sincronização

#### 1. Check-in Diário
```json
{
  "date": "2026-05-07",
  "status": "bem",
  "points": 10,
  "timestamp": 1715079600000
}
```

#### 2. Hidratação
```json
{
  "date": "2026-05-07",
  "cups": 4,
  "total": 1400,
  "goal": 2870,
  "timestamp": 1715079600000
}
```

#### 3. Pressão Arterial
```json
{
  "systolic": 120,
  "diastolic": 80,
  "status": "normal",
  "timestamp": 1715079600000
}
```

#### 4. Sintomas
```json
{
  "date": "2026-05-07",
  "symptoms": ["dor_leve_costas", "cansaco"],
  "timestamp": 1715079600000
}
```

#### 5. Pontos e Recompensas
```json
{
  "points": 60,
  "level": 2,
  "timestamp": 1715079600000
}
```

---

## 🧪 Fluxo de Teste Completo

### Passo 1: Onboarding
1. Abrir app
2. Clicar em "Começar Agora"
3. Validar telas de onboarding (4 telas)
4. Clicar em "Próximo" em cada tela
5. Clicar em "Concluir" na última tela

### Passo 2: Cadastro
1. Clicar em "Cadastro"
2. Preencher com dados acima
3. Validar validação de campos
4. Clicar em "Cadastrar"
5. Validar mensagem de sucesso

### Passo 3: Login
1. Usar email: `joao.teste@canteiro.com`
2. Usar senha: `Teste@123`
3. Clicar em "Entrar"
4. Validar redirecionamento para Home

### Passo 4: Home Screen
1. Validar exibição do nome "João Silva Teste"
2. Validar exibição de pontos (60)
3. Validar exibição de nível (2)
4. Validar atalhos rápidos (Hidratação, Pressão, Ergonomia, Desafios)

### Passo 5: Check-in
1. Clicar em "Como você está?"
2. Selecionar "Tudo bem"
3. Validar mensagem de sucesso
4. Validar +10 pontos adicionados

### Passo 6: Hidratação
1. Ir para aba "Saúde"
2. Clicar em "Hidratação"
3. Clicar em 4 copos
4. Validar total: 1400ml / 2870ml
5. Validar progresso visual

### Passo 7: Pressão
1. Clicar em "Registrar Pressão"
2. Preencher: Sistólica 120, Diastólica 80
3. Clicar em "Salvar"
4. Validar status "Normal"
5. Validar no histórico

### Passo 8: Sintomas
1. Clicar em "Sintomas"
2. Selecionar "Dor leve nas costas" e "Cansaço"
3. Clicar em "Registrar"
4. Validar no histórico

### Passo 9: Perfil
1. Ir para aba "Perfil"
2. Validar dados exibidos
3. Clicar em "Editar"
4. Alterar peso para 85
5. Clicar em "Salvar"
6. Validar novo peso exibido

### Passo 10: Sincronização Firebase
1. Com internet: Validar sincronização automática
2. Sem internet: Validar fila de sincronização
3. Reconectar internet: Validar processamento da fila

---

## 🎨 Verificação de Estética

### App Mobile
- ✅ Paleta verde (#1B8A4C) consistente
- ✅ Tipografia legível
- ✅ Espaçamento adequado
- ✅ Ícones claros
- ✅ Cards bem definidos

### Admin Panel
- ✅ Mesma paleta verde (#1B8A4C)
- ✅ Layout responsivo
- ✅ Tabs funcionais
- ✅ Gráficos visuais
- ✅ Cores de status (normal, elevada, alta)

---

## 📱 Acesso ao App

### URLs
- **Dev Server**: https://8081-iv2y9pale4vmxfkhii24k-0399be6f.us2.manus.computer
- **API**: http://127.0.0.1:3000
- **QR Code (Expo)**: exps://8081-iv2y9pale4vmxfkhii24k-0399be6f.us2.manus.computer

### Admin Panel
- **Email**: admin@canteiro.com
- **Senha**: admin123
- **URL**: `/admin-panel`

---

## 🔧 Troubleshooting

### Se o app não carregar:
1. Verificar conexão de internet
2. Limpar cache do navegador
3. Recarregar página

### Se a sincronização não funcionar:
1. Verificar credenciais Firebase
2. Validar variáveis de ambiente
3. Verificar conexão de rede

### Se o Admin Panel não mostrar dados:
1. Fazer login com credenciais corretas
2. Validar dados no Firebase
3. Verificar console para erros

---

## ✅ Checklist de Validação

- [ ] Onboarding completo
- [ ] Cadastro funcionando
- [ ] Login funcionando
- [ ] Home screen exibindo dados
- [ ] Check-in registrando pontos
- [ ] Hidratação sincronizando
- [ ] Pressão registrando
- [ ] Sintomas salvando
- [ ] Perfil editável
- [ ] Sincronização offline-first
- [ ] Admin panel mostrando dados
- [ ] Estética consistente
- [ ] Modo escuro funcionando
- [ ] Idiomas funcionando
- [ ] Notificações push configuradas

