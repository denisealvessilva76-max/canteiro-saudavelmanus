# Análise de Melhorias - Canteiro Saudável

## Baseado em: Dossiê Técnico + PDF de Referência Visual (27 páginas)

### 🎯 Funcionalidades Identificadas no Projeto Original

#### 1. **Módulo de Saúde Mental** ✅ NOVO
- **Localização**: Aba "Saúde" > Sub-aba "Saúde Mental"
- **Funcionalidades**:
  - Técnica de Respiração 4-7-8 (com guia passo a passo)
  - Dicas diárias para bem-estar
  - Contato direto com SESMT/Psicólogos via WhatsApp
  - Recursos de emergência (CVV, CAPS)
  - Mapa de Saúde Mental com recursos locais
  - Sigilo profissional garantido

#### 2. **Triagem de Saúde** ✅ NOVO
- **Localização**: Aba "Saúde" > Sub-aba "Triagem"
- **Funcionalidades**:
  - Cálculo de IMC (Peso / Altura²)
  - Medição de Glicemia (mg/dL)
  - Medição de Pressão Arterial (Sistólica/Diastólica)
  - Alertas automáticos:
    - IMC > 30: Sobrepeso
    - Glicemia > 126: Alerta de Diabetes
    - Pressão > 140/90: Hipertensão
  - Histórico de medições
  - Sincronização com Admin para monitoramento

#### 3. **Ergonomia Detalhada** ✅ NOVO
- **Localização**: Aba "Ergonomia"
- **Funcionalidades**:
  - Vídeos de exercícios (alongamento, postura, respiração)
  - Guia de postura correta
  - Pausas ativas recomendadas
  - Exercícios específicos por tipo de trabalho

#### 4. **Sistema de Notificações Inteligentes** ✅ NOVO
- **Check-in Diário**: Lembrete às 08:00 se não realizado
- **Hidratação**: Lembretes periódicos (ex: a cada 2 horas)
- **Alongamento**: Lembrete diário para pausa ativa
- **Avisos**: Notificação ao publicar novo Comunicado/Informativo
- **Implementação**: Usar `expo-notifications` + Agendamento local

#### 5. **Comunicados com Filtros** ✅ PARCIAL
- **Filtros**: Todos, Urgente, Informativo, Geral
- **Funcionalidades**:
  - Marcar como lido
  - Sincronização com Firebase
  - Notificação push ao publicar

#### 6. **Recompensas e Gamificação** ✅ PARCIAL
- **Pontos**: Ganhos por atividades (check-in, hidratação, desafios)
- **Resgates**: Vale-compras (R$50, R$100, R$200)
- **Abas**: Todos, Vale-Compras, Brindes

#### 7. **Painel Admin** ✅ COMPLETO
- **Abas**: Dashboard, Funcionários, Desafios, Comunicados
- **Funcionalidades**:
  - Relatório PDF com estatísticas
  - Monitoramento em tempo real
  - Gerenciamento de funcionários
  - Publicação de comunicados

---

## 📋 Plano de Implementação

### Fase 5: Saúde Mental + Recursos de Emergência
1. Criar tela `app/(tabs)/saude-mental.tsx`
2. Implementar técnica de respiração 4-7-8
3. Adicionar contatos SESMT/Psicólogos com link WhatsApp
4. Integrar com Firebase para sincronização

### Fase 6: Triagem de Saúde + Ergonomia
1. Criar tela `app/(tabs)/triagem.tsx` com formulário de medições
2. Implementar cálculo de IMC e alertas
3. Melhorar tela de Ergonomia com vídeos e exercícios
4. Adicionar histórico de medições

### Fase 7: Notificações Inteligentes
1. Criar hook `use-notification-scheduler.ts`
2. Agendar notificações para:
   - Check-in: 08:00 (se não realizado)
   - Hidratação: A cada 2h (configurável)
   - Alongamento: 12:00 (pausa ativa)
   - Avisos: Quando publicado novo comunicado
3. Sincronizar com Firebase para controle remoto

### Fase 8: Refinamento Visual
1. Ajustar cores das abas conforme PDF
2. Padronizar ícones (Home, Ergonomia, Saúde, Avisos, Perfil)
3. Melhorar layout de cards e componentes
4. Adicionar animações e transições

---

## 🎨 Referências Visuais (PDF)

### Cores Identificadas:
- **Verde Principal**: #00A86B (Canteiro Saudável)
- **Azul Secundário**: #0066CC (Botões de ação)
- **Vermelho Alerta**: #FF3333 (Avisos urgentes)
- **Cinza Neutro**: #F5F5F5 (Backgrounds)

### Abas Principais:
1. **Home** 🏠: Dashboard com resumo do dia
2. **Ergonomia** 🏋️: Exercícios e postura
3. **Saúde** ❤️: Hidratação, Triagem, Saúde Mental
4. **Avisos** 🔔: Comunicados e notificações
5. **Perfil** 👤: Dados pessoais e preferências

---

## ✅ Checklist de Conclusão

- [ ] Módulo de Saúde Mental implementado
- [ ] Triagem de Saúde com alertas funcionando
- [ ] Notificações agendadas e testadas
- [ ] Ergonomia com vídeos integrados
- [ ] Visual refinado conforme PDF
- [ ] Zero erros de TypeScript
- [ ] Deploy no GitHub Pages
- [ ] Testes em dispositivo real (iOS/Android)

