SHELL = /bin/bash
.ONESHELL:
.DEFAULT_GOAL: help

help: ## Prints available commands
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make \033[36m<target>\033[0m\n"} /^[.a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

stress-test: ## Run stress test
	@sh load-test/stress-test.sh

run-rinha: ## Run the application locally
	@rm -rf db/data
	@docker compose -f docker-compose-rinha.yml up --build

run-infra: ## Run the infra locally
	@rm -rf db/data
	@docker compose -f docker-compose-infra.yml up --build

make health-check: ## Run health check
	@curl localhost:9999/ping
