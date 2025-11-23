# CACMDesa-Next Docker Deployment Makefile
# Convenient commands for managing Docker deployment

.PHONY: help build up down logs restart clean backup restore health test-connection

# Default target
.DEFAULT_GOAL := help

# Color output
YELLOW := \033[1;33m
GREEN := \033[1;32m
RED := \033[1;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)CACMDesa-Next Deployment Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker compose build

up: ## Start all services (app + database)
	@echo "$(GREEN)Starting services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)Services started! Check status with 'make status'$(NC)"

up-with-nginx: ## Start all services including nginx
	@echo "$(GREEN)Starting services with Nginx...$(NC)"
	docker compose --profile with-nginx up -d
	@echo "$(GREEN)Services started with Nginx!$(NC)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker compose down

down-volumes: ## Stop services and remove volumes (DESTRUCTIVE!)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "$(RED)All services and volumes removed$(NC)"; \
	fi

logs: ## View logs from all services
	docker compose logs -f

logs-app: ## View application logs only
	docker compose logs -f app

logs-db: ## View database logs only
	docker compose logs -f mssql

status: ## Check status of all services
	@echo "$(GREEN)Service Status:$(NC)"
	docker compose ps
	@echo ""
	@echo "$(GREEN)Health Status:$(NC)"
	@make health --no-print-directory

health: ## Check application health
	@curl -s http://localhost:3000/api/health | jq . || echo "$(RED)Health check failed$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	docker compose restart
	@echo "$(GREEN)Services restarted!$(NC)"

restart-app: ## Restart only the application
	@echo "$(YELLOW)Restarting application...$(NC)"
	docker compose restart app
	@echo "$(GREEN)Application restarted!$(NC)"

rebuild: ## Rebuild and restart the application
	@echo "$(GREEN)Rebuilding application...$(NC)"
	docker compose build --no-cache app
	docker compose up -d app
	@echo "$(GREEN)Application rebuilt and restarted!$(NC)"

shell-app: ## Open shell in application container
	docker compose exec app sh

shell-db: ## Open SQL Server CLI
	docker compose exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$$(grep DB_PASSWORD .env.production | cut -d '=' -f2)"

db-push: ## Push Prisma schema to database
	@echo "$(GREEN)Pushing schema to database...$(NC)"
	docker compose exec app npx prisma db push

db-seed: ## Seed database with initial data
	@echo "$(GREEN)Seeding database...$(NC)"
	docker compose exec app npx prisma db seed

db-setup: ## Complete database setup (push + seed)
	@echo "$(GREEN)Setting up database...$(NC)"
	@make db-push
	@make db-seed
	@echo "$(GREEN)Database setup complete!$(NC)"

backup: ## Backup database
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p backups
	docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
		-S localhost -U sa -P "$$(grep DB_PASSWORD .env.production | cut -d '=' -f2)" \
		-Q "BACKUP DATABASE CACMDesa TO DISK='/var/opt/mssql/backup/cacmdesa-$$(date +%Y%m%d-%H%M%S).bak'"
	@echo "$(GREEN)Backup created!$(NC)"

restore: ## Restore database from latest backup
	@echo "$(YELLOW)Restoring database from backup...$(NC)"
	@latest=$$(ls -t backups/*.bak 2>/dev/null | head -1); \
	if [ -z "$$latest" ]; then \
		echo "$(RED)No backup files found in backups/ directory$(NC)"; \
		exit 1; \
	fi; \
	echo "$(GREEN)Restoring from: $$latest$(NC)"; \
	docker compose cp "$$latest" mssql:/var/opt/mssql/backup/restore.bak; \
	docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
		-S localhost -U sa -P "$$(grep DB_PASSWORD .env.production | cut -d '=' -f2)" \
		-Q "RESTORE DATABASE CACMDesa FROM DISK='/var/opt/mssql/backup/restore.bak' WITH REPLACE"; \
	docker compose restart app; \
	echo "$(GREEN)Database restored!$(NC)"

clean: ## Remove unused Docker resources
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

clean-all: ## Remove all Docker resources (images, containers, volumes)
	@echo "$(RED)WARNING: This will remove ALL Docker resources!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -a --volumes -f; \
		echo "$(RED)All Docker resources removed$(NC)"; \
	fi

setup: ## First-time setup (build + start + database setup)
	@echo "$(GREEN)Running first-time setup...$(NC)"
	@if [ ! -f .env.production ]; then \
		echo "$(RED)Error: .env.production not found!$(NC)"; \
		echo "$(YELLOW)Please copy .env.production.example to .env.production and configure it.$(NC)"; \
		exit 1; \
	fi
	@make build
	@make up
	@echo "$(YELLOW)Waiting for services to be ready...$(NC)"
	@sleep 10
	@make db-setup
	@echo ""
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)Setup complete!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@echo "Access the application at: $(YELLOW)http://localhost:3000$(NC)"
	@echo "Default credentials:"
	@echo "  Username: $(YELLOW)admin$(NC)"
	@echo "  Password: $(YELLOW)admin123$(NC)"
	@echo "  Fiscal Year: $(YELLOW)2025$(NC)"
	@echo ""
	@echo "$(RED)IMPORTANT: Change the admin password after first login!$(NC)"
	@echo ""

update: ## Update application (pull + rebuild + restart)
	@echo "$(GREEN)Updating application...$(NC)"
	git pull
	@make rebuild
	@echo "$(GREEN)Application updated!$(NC)"

test-connection: ## Test database connection
	@echo "$(GREEN)Testing database connection...$(NC)"
	docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
		-S localhost -U sa -P "$$(grep DB_PASSWORD .env.production | cut -d '=' -f2)" \
		-Q "SELECT @@VERSION; SELECT name FROM sys.databases WHERE name='CACMDesa';"

stats: ## Show resource usage statistics
	docker stats --no-stream

dev: ## Start in development mode (database only)
	@echo "$(GREEN)Starting database for development...$(NC)"
	docker compose up -d mssql
	@echo "$(GREEN)Database started! Run 'npm run dev' to start the application.$(NC)"
