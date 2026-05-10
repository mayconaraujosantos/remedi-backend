# Variáveis
DB_COMPOSE = podman compose -f infra/compose/database.yml
OBS_COMPOSE = podman compose -f infra/compose/observability.yml
PM = pnpm

.PHONY: dev build start test lint format up down logs ps shell clean install help seed

install: ## Instala as dependências do projeto
	$(PM) install

dev: ## Inicia o ambiente de desenvolvimento (watch mode)
	$(PM) run dev

test: ## Executa os testes com Vitest
	$(PM) run test

seed: ## Popula o banco de dados com dados iniciais
	$(PM) run db:seed

lint: ## Executa o linter e o formatador
	$(PM) run lint:fix
	$(PM) run format

# --- Ciclo de Vida Infra ---
up: ## Sobe toda a infraestrutura (DB e Observabilidade)
	$(DB_COMPOSE) up -d
	$(OBS_COMPOSE) up -d

down: ## Derruba toda a infraestrutura
	$(OBS_COMPOSE) down
	$(DB_COMPOSE) down

db-up: ## Sobe apenas o banco de dados e redis
	$(DB_COMPOSE) up -d

obs-up: ## Sobe apenas a observabilidade
	$(OBS_COMPOSE) up -d

logs:
	$(DB_COMPOSE) logs -f

ps:
	$(DB_COMPOSE) ps
	$(OBS_COMPOSE) ps