# Progresso do Projeto - Reminder API

Este documento registra as funcionalidades e melhorias implementadas recentemente no projeto.

## 🛠️ Infraestrutura e Observabilidade
- **Observabilidade Full-Stack**: Implementação de pipeline com OpenTelemetry (OTel), Prometheus e Grafana.
- **Métricas Customizadas**: Rastreamento de taxa de adesão, doses tomadas (planejadas vs ad-hoc), doses perdidas e latência de notificações.
- **Dashboard Grafana**: Criação de dashboard provisionado com gráficos de pizza, gauge e séries temporais.
- **Infraestrutura Modular**: Reorganização dos arquivos Compose em `infra/compose/` (Database e Observability) para maior flexibilidade no desenvolvimento local com Podman.

## 🧠 Lógica de Domínio e Casos de Uso
- **Soft Delete**: Implementação de exclusão lógica para Medicamentos, preservando o histórico para análise de métricas.
- **Doses Ad-hoc**: Novo caso de uso para registro de doses extras não agendadas.
- **Ajuste de Timezone**: Migração de cálculos de data para UTC (`setUTCHours`) para garantir consistência entre diferentes fusos horários de servidores.

## 🧪 Qualidade e Testes
- **Cultura TDD**: Implementação de testes unitários para os casos de uso principais (`GenerateDoseEvents`, `MarkDoseAsTaken`).
- **Test Doubles**: Uso sistemático de Mocks, Stubs, Fakes e Spies com Vitest para isolamento total da lógica de negócio.
- **Fixação de Tempo**: Uso de `FakeTimers` para validar delays de fila de forma determinística.

## 📖 Documentação e Developer Experience
- **Auto-Swagger**: Exportação automática do `swagger.yaml` na raiz do projeto ao iniciar o servidor.
- **Postman Collection**: Criação e atualização de coleção JSON para testes manuais rápidos.
- **GitOps Ready**: Criação de manifestos Kubernetes e Application do Argo CD para deploy automatizado.

---
*Documento atualizado em: 10/05/2026*
