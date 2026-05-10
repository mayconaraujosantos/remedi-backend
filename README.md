# Remedi Backend - Medication Adherence API 💊

API robusta para gerenciamento de medicamentos e lembretes de doses, construída com foco em **Clean Architecture**, **DDD** e **Observabilidade**.

## 🚀 Tecnologias
- **Runtime**: Node.js (v20+) com TypeScript
- **Framework**: Fastify
- **ORM**: Drizzle ORM (PostgreSQL)
- **Fila**: BullMQ (Redis)
- **DI**: tsyringe
- **Observabilidade**: OpenTelemetry, Prometheus, Grafana
- **Testes**: Vitest

## 🏗️ Arquitetura
O projeto segue os princípios da **Arquitetura Limpa (Clean Architecture)**:
- `src/domain`: Entidades e regras de negócio puras.
- `src/application`: Casos de uso e serviços de aplicação.
- `src/infra`: Implementações técnicas (Banco de dados, Filas, HTTP).
- `src/main`: Composição da aplicação (DI Container, Servidor).

## 📊 Observabilidade
O sistema possui uma pipeline completa de métricas:
- **Taxa de Adesão**: Monitoramento em tempo real de doses tomadas vs. perdidas.
- **Doses Ad-hoc**: Distinção entre doses planejadas e doses extras tomadas pelo usuário.
- **Performance**: Latência de processamento de notificações e throughput.

O dashboard do Grafana pode ser acessado em `http://localhost:3000` (admin/admin).

## 🛠️ Como Iniciar

### Pré-requisitos
- Podman (ou Docker)
- pnpm

### 1. Subir a Infraestrutura
```bash
make up
```
*Isso inicia o Postgres, Redis, OTel Collector, Prometheus e Grafana.*

### 2. Iniciar a Aplicação
```bash
pnpm install
pnpm dev
```

### 3. Popular Dados de Teste
```bash
make seed
```

## 📖 Documentação da API
A documentação Swagger é gerada automaticamente ao iniciar o servidor e pode ser acessada em:
`http://localhost:3333/docs`

Também há uma coleção do Postman disponível na raiz: `postman_collection.json`.

## 🧪 Testes
Seguimos a cultura de **TDD**. Para rodar a suíte de testes unitários:
```bash
make test
```

## 🚢 CD (GitOps)
O projeto está pronto para deploy em Kubernetes via **Argo CD**. Os manifestos encontram-se em `infra/k8s/` e a configuração da aplicação em `infra/argo/`.

---
Desenvolvido por [mayconaraujosantos](https://github.com/mayconaraujosantos)
