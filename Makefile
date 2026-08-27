.DEFAULT_GOAL := help

PNPM ?= pnpm

.PHONY: help install dev typecheck lint test build build-stage

help:
	@printf "Available targets:\n"
	@printf "  make install       Install dependencies\n"
	@printf "  make dev           Release port 27515 and start Vite\n"
	@printf "  make typecheck     Run TypeScript checks\n"
	@printf "  make lint          Run Oxlint\n"
	@printf "  make test          Run Vitest\n"
	@printf "  make build         Build the production Web bundle\n"
	@printf "  make build-stage   Build the stage Web bundle\n"

install:
	@$(PNPM) install

dev:
	@$(PNPM) dev

typecheck:
	@$(PNPM) typecheck

lint:
	@$(PNPM) lint

test:
	@$(PNPM) test

build:
	@$(PNPM) build

build-stage:
	@$(PNPM) build:stage
