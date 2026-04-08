# Requisitos Extraídos do Documento - Canteiro Saudável

## Tela de Cadastro (Página 1)
- ✅ Nome Completo (obrigatório)
- ✅ Matrícula (obrigatório, começa com 3450)
- ✅ Função (dropdown, "Outro" selecionado)
- ✅ Turno (dropdown, "Selecione...")
- ✅ Peso (kg) - Ex: 75
- ✅ Altura (cm) - (campo cortado, mas existe)

## Tela de Login (Página 2)
- ✅ Bem-vindo! Faça login para continuar
- ✅ Matrícula (campo de entrada)
- ✅ Nome Completo (campo de entrada)
- ✅ Turno de Trabalho (2 opções com ícones):
  - ☀️ Diurno (7h30 - 17h30)
  - 🌙 Noturno (17h30 - 3h30)
- ✅ Botão "Entrar" (verde)
- ✅ Mensagem: "Seus dados serão salvos com segurança e você não precisará fazer login novamente"

## Tela Home (Página 3-4)
- ✅ Saudação: "Boa tarde, Trabalhador 👋"
- ✅ Subtítulo: "Canteiro Saudável • Cuide-se!"
- ✅ Indicador de dias: "0 dias 🔥" (com bolinhas de progresso)
- ✅ Seção "Como você está hoje?" com 3 opções:
  - 😊 Tudo bem! (Sem dores hoje)
  - 😐 Com dor leve (Dor suportável)
  - 😢 Com dor forte (Preciso de ajuda)
- ✅ Ações Rápidas (grid 2x2):
  - 💧 Hidratação
  - 📱 Pressão
  - 🧘 Ergonomia
  - 🏆 Desafios
- ✅ Resumo da Semana com 3 cards:
  - 2 Check-ins
  - 0.0L Água hoje
  - 15 Pontos
- ✅ 3 Cards adicionais (Página 4):
  - 🏆 Ranking (Posição)
  - 🎖️ Conquistas (Medalhas)
  - 🎁 Prêmios (Resgatar)
- ✅ Tab bar com 5 abas:
  - 🏠 Home
  - 🔧 Ergonomia
  - ❤️ Saúde
  - 🔔 Avisos
  - 👤 Perfil

## Tela Saúde (Página 5)
- ✅ Data: 2026-02-06
- ✅ Botão "+ Registrar Pressão"
- ✅ Seção "Sintomas" com checkboxes:
  - Dor nas costas
  - Dor no ombro
  - Dor de cabeça
- ✅ Mensagem de sucesso: "Sintomas reportados com sucesso! O SESMT foi notificado."
- ✅ Seção "Saúde Mental" com:
  - 🧠 Ícone de cérebro
  - Instruções: "Respire profundamente. Inspire por 4 segundos, segure por 4 segundos, e expire por 4 segundos. Repita 5 vezes."
  - Botão "Iniciar Respiração Guiada"

## Status de Implementação

### Funcionalidades Implementadas ✅
- [x] Tela de cadastro com formulário
- [x] Tela de login com seleção de turno
- [x] Home screen com check-in diário
- [x] Ações rápidas (Hidratação, Pressão, Ergonomia, Desafios)
- [x] Resumo da semana
- [x] Tab bar com 5 abas
- [x] Tela de saúde com registro de pressão
- [x] Sintomas com checkboxes
- [x] Saúde mental com respiração guiada
- [x] Ranking, Conquistas, Prêmios

### Funcionalidades Faltando ❌
- [ ] **CRÍTICO: Tela preta ao clicar em opções** (BUG)
- [ ] **CRÍTICO: Sem tela de login visível** (vai direto para check-in)
- [ ] Painel Admin com autenticação
- [ ] Painel Admin com abas de prêmios e notícias
- [ ] Painel Admin carregando dados em tempo real

### Melhorias de Estética e Usabilidade
- [ ] Check-in com status visual "✓ Feito" (Página 4)
- [ ] Indicador de dias com bolinhas de progresso
- [ ] Cards com cores diferenciadas (azul, verde, amarelo)
- [ ] Ícones mais visuais e consistentes
- [ ] Transições suaves entre telas
- [ ] Loading states mais claros
- [ ] Feedback visual ao clicar em botões
