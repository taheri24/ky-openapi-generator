.PHONY: help build dev test test-watch test-coverage clean gen gen-example install check-bun check-pnpm publish publish-dry lint format setup rebuild all watch

# Detect package manager (pnpm preferred, fallback to npm)
ifeq ($(shell command -v pnpm 2> /dev/null),)
  PKG_MANAGER := npm
else
  PKG_MANAGER := pnpm
endif

# Color output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║     ky-openapi-generator - Development & Build Tools           ║$(NC)"
	@echo "$(BLUE)║     (Package Manager: $(PKG_MANAGER))$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Build Commands:$(NC)"
	@echo "  make build              - Build TypeScript to JavaScript"
	@echo "  make dev                - Watch mode for development"
	@echo "  make clean              - Remove dist directory"
	@echo ""
	@echo "$(GREEN)Testing Commands:$(NC)"
	@echo "  make test               - Run all tests once"
	@echo "  make test-watch         - Run tests in watch mode"
	@echo "  make test-coverage      - Run tests with coverage report"
	@echo ""
	@echo "$(GREEN)Generation Commands:$(NC)"
	@echo "  make gen SPEC=<file>    - Generate client from OpenAPI spec (use bun if available)"
	@echo "  make gen-node SPEC=<file> - Generate client using Node.js"
	@echo "  make gen-example        - Generate example client from petstore.openapi.json"
	@echo ""
	@echo "$(GREEN)CLI Commands (with bun):$(NC)"
	@echo "  make cli ARGS=\"<args>\"  - Run CLI with bun (e.g., make cli ARGS=\"spec.json --output client.ts\")"
	@echo "  make cli-help           - Show CLI help message"
	@echo "  make cli-version        - Show CLI version"
	@echo ""
	@echo "$(GREEN)Publishing Commands:$(NC)"
	@echo "  make publish-dry        - Test publish (dry-run)"
	@echo "  make publish            - Publish to npm (requires authentication)"
	@echo "  make publish-check      - Check package version and dependencies"
	@echo ""
	@echo "$(GREEN)Utility Commands:$(NC)"
	@echo "  make install            - Install dependencies"
	@echo "  make check-pnpm         - Check if pnpm is installed"
	@echo "  make check-bun          - Check if bun is installed"
	@echo "  make lint               - Run linter (if configured)"
	@echo "  make format             - Format code (if configured)"
	@echo "  make status             - Show git status and version"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make gen SPEC=openapi.json"
	@echo "  make gen SPEC=openapi.json --output client.ts --baseUrl https://api.example.com"
	@echo "  make cli ARGS=\"--help\""
	@echo "  make gen-example && make test"
	@echo ""

# ============================================================================
# BUILD COMMANDS
# ============================================================================

build:
	@echo "$(BLUE)Building TypeScript (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) run build
	@echo "$(GREEN)✓ Build completed$(NC)"

dev:
	@echo "$(BLUE)Starting watch mode (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) run dev

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@rm -rf dist/
	@echo "$(GREEN)✓ Cleaned$(NC)"

# ============================================================================
# TESTING COMMANDS
# ============================================================================

test:
	@echo "$(BLUE)Running tests (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) test

test-watch:
	@echo "$(BLUE)Running tests in watch mode (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) run test-watch

test-coverage:
	@echo "$(BLUE)Running tests with coverage (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) run test-coverage

# ============================================================================
# GENERATION COMMANDS
# ============================================================================

check-pnpm:
	@command -v pnpm >/dev/null 2>&1 && echo "$(GREEN)✓ pnpm is installed ($(shell pnpm --version))$(NC)" || echo "$(YELLOW)⚠ pnpm not found. Install from https://pnpm.io$(NC)"

check-bun:
	@command -v bun >/dev/null 2>&1 && echo "$(GREEN)✓ bun is installed ($(shell bun --version))$(NC)" || echo "$(YELLOW)⚠ bun not found. Install from https://bun.sh$(NC)"

gen: check-bun
	@if [ -z "$(SPEC)" ]; then \
		echo "$(RED)✗ Error: SPEC not specified$(NC)"; \
		echo "Usage: make gen SPEC=openapi.json"; \
		exit 1; \
	fi
	@if command -v bun >/dev/null 2>&1; then \
		echo "$(BLUE)Generating client with bun ($(SPEC))...$(NC)"; \
		bun dist/cli.js $(SPEC); \
	else \
		echo "$(YELLOW)bun not found, using node...$(NC)"; \
		node dist/cli.js $(SPEC); \
	fi

gen-node:
	@if [ -z "$(SPEC)" ]; then \
		echo "$(RED)✗ Error: SPEC not specified$(NC)"; \
		echo "Usage: make gen-node SPEC=openapi.json"; \
		exit 1; \
	fi
	@echo "$(BLUE)Generating client with node ($(SPEC)) using $(PKG_MANAGER)...$(NC)"
	@$(PKG_MANAGER) run build
	@node dist/cli.js $(SPEC)

gen-example:
	@echo "$(BLUE)Generating example client (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) run gen:example

# ============================================================================
# CLI COMMANDS
# ============================================================================

cli: check-bun
	@if [ -z "$(ARGS)" ]; then \
		echo "$(RED)✗ Error: ARGS not specified$(NC)"; \
		echo "Usage: make cli ARGS=\"<arguments>\""; \
		echo "Example: make cli ARGS=\"spec.json --output client.ts\""; \
		exit 1; \
	fi
	@if command -v bun >/dev/null 2>&1; then \
		echo "$(BLUE)Running CLI with bun: $(ARGS)$(NC)"; \
		bun dist/cli.js $(ARGS); \
	else \
		echo "$(YELLOW)bun not found, using node...$(NC)"; \
		$(PKG_MANAGER) run build > /dev/null 2>&1; \
		node dist/cli.js $(ARGS); \
	fi

cli-help:
	@echo "$(BLUE)CLI Help:$(NC)"
	@if command -v bun >/dev/null 2>&1; then \
		bun dist/cli.js --help; \
	else \
		$(PKG_MANAGER) run build > /dev/null 2>&1; \
		node dist/cli.js --help; \
	fi

cli-version:
	@if command -v bun >/dev/null 2>&1; then \
		bun dist/cli.js --version; \
	else \
		$(PKG_MANAGER) run build > /dev/null 2>&1; \
		node dist/cli.js --version; \
	fi

# ============================================================================
# PUBLISHING COMMANDS
# ============================================================================

publish-check:
	@echo "$(BLUE)Checking package configuration...$(NC)"
	@echo "$(GREEN)Package Version:$(NC)"
	@grep '"version"' package.json | head -1
	@echo ""
	@echo "$(GREEN)Package Name:$(NC)"
	@grep '"name"' package.json | head -1
	@echo ""
	@echo "$(GREEN)Main Entry:$(NC)"
	@grep '"main"' package.json
	@echo ""
	@echo "$(GREEN)Package Manager:$(NC)"
	@grep '"packageManager"' package.json
	@echo ""
	@echo "$(GREEN)Bin Command:$(NC)"
	@grep -A1 '"bin"' package.json

publish-dry:
	@echo "$(YELLOW)Running dry-run publish (using $(PKG_MANAGER))...$(NC)"
	@$(PKG_MANAGER) run build
	@$(PKG_MANAGER) run publish:dry

publish: publish-check
	@echo ""
	@echo "$(YELLOW)⚠ WARNING: This will publish to npm registry$(NC)"
	@echo ""
	@read -p "Are you sure you want to publish? (y/n) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Building and publishing (using $(PKG_MANAGER))...$(NC)"; \
		$(PKG_MANAGER) run build; \
		npm publish; \
		echo "$(GREEN)✓ Published successfully$(NC)"; \
		echo ""; \
		echo "$(GREEN)Package URL:$(NC)"; \
		npm pkg get name | tr -d '"' | xargs -I {} echo "https://www.npmjs.com/package/{}"; \
	else \
		echo "$(YELLOW)Publish cancelled$(NC)"; \
	fi

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

install:
	@echo "$(BLUE)Installing dependencies using $(PKG_MANAGER)...$(NC)"
	@$(PKG_MANAGER) install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

lint:
	@echo "$(YELLOW)No linter configured yet$(NC)"
	@echo "Consider adding: eslint, prettier, or similar"

format:
	@echo "$(YELLOW)No formatter configured yet$(NC)"
	@echo "Consider adding: prettier or similar"

status:
	@echo "$(BLUE)Project Status:$(NC)"
	@echo ""
	@echo "$(GREEN)Package Manager:$(NC)"
	@echo "  $(PKG_MANAGER)"
	@echo ""
	@echo "$(GREEN)Git Status:$(NC)"
	@git status --short || echo "Not a git repository"
	@echo ""
	@echo "$(GREEN)Version:$(NC)"
	@grep '"version"' package.json | head -1
	@echo ""
	@echo "$(GREEN)Dependencies:$(NC)"
	@$(PKG_MANAGER) list --depth=0 2>/dev/null | grep -E "ky|ts-jest|jest" || $(PKG_MANAGER) list --depth=0
	@echo ""
	@echo "$(GREEN)Node Version:$(NC)"
	@node --version
	@echo ""
	@echo "$(GREEN)npm Version:$(NC)"
	@npm --version
	@echo ""
	@echo "$(GREEN)pnpm Version:$(NC)"
	@pnpm --version 2>/dev/null || echo "Not installed"

# ============================================================================
# DEVELOPMENT WORKFLOWS
# ============================================================================

setup: install build gen-example test
	@echo "$(GREEN)✓ Project setup complete!$(NC)"
	@echo "Run 'make help' for available commands"

rebuild: clean build
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

all: build test gen-example
	@echo "$(GREEN)✓ All tasks completed$(NC)"

watch: dev

.DEFAULT_GOAL := help
