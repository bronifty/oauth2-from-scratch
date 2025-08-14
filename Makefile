.PHONY: help install start stop clean oauth-servers nix-start nix-stop nix-clean spa-dev spa-build status all-dev

# Default target
help:
	@echo "🔧 OAuth2 Development Environment"
	@echo ""
	@echo "Available targets:"
	@echo "  help          - Show this help message"
	@echo "  install       - Install dependencies for both root and SPA"
	@echo "  oauth-servers - Start OAuth servers (auth, client, resource)"
	@echo "  nix-start     - Start nix development proxy"
	@echo "  nix-stop      - Stop nix proxy"
	@echo "  nix-clean     - Stop nix proxy and cleanup /etc/hosts"
	@echo "  spa-dev       - Start SPA development server"
	@echo "  spa-build     - Build SPA for production"
	@echo "  status        - Check status of all services"
	@echo "  all-dev       - Start OAuth servers, nix proxy, and SPA (recommended)"
	@echo "  start         - Alias for all-dev"
	@echo "  stop          - Stop all services"
	@echo "  clean         - Clean up everything"
	@echo ""
	@echo "🚀 Quick start: make start"

# Install dependencies
install:
	@echo "📦 Installing root dependencies..."
	bun install
	@echo "📦 Installing SPA dependencies..."
	cd spa && bun install
	@echo "✅ All dependencies installed"

# Start OAuth servers using the existing script
oauth-servers:
	@echo "🚀 Starting OAuth servers..."
	./run-oauth-servers.sh

# Start nix development proxy
nix-start:
	@echo "🌐 Starting nix development proxy..."
	nix run . -- start

# Stop nix proxy
nix-stop:
	@echo "🛑 Stopping nix proxy..."
	nix run . -- stop

# Clean up nix proxy and hosts file
nix-clean:
	@echo "🧹 Cleaning up nix proxy..."
	nix run . -- clean

# Start SPA development server
spa-dev:
	@echo "⚛️  Starting SPA development server..."
	cd spa && bun run dev

# Build SPA for production
spa-build:
	@echo "🏗️  Building SPA..."
	cd spa && bun run build

# Check status of services
status:
	@echo "📊 Checking service status..."
	@echo ""
	@echo "=== Nix Proxy Status ==="
	nix run . -- status
	@echo ""
	@echo "=== Process Status ==="
	@echo "OAuth servers:"
	@pgrep -f "authorizationServer.js\|client.js\|protectedResource.js" > /dev/null && echo "✅ OAuth servers running" || echo "❌ OAuth servers not running"
	@echo "SPA dev server:"
	@pgrep -f "react-router dev" > /dev/null && echo "✅ SPA dev server running" || echo "❌ SPA dev server not running"
	@echo ""
	@echo "=== Port Usage ==="
	@echo "Active ports:"
	@lsof -i :9000,9001,9002,5173,80 2>/dev/null | grep LISTEN || echo "No development servers detected on expected ports"

# Start everything for development (recommended)
all-dev:
	@echo "🚀 Starting complete development environment..."
	@echo ""
	@echo "This will start:"
	@echo "  1. Nix development proxy (nginx on port 80)"
	@echo "  2. OAuth servers (ports 9000, 9001, 9002)"
	@echo "  3. SPA development server (port 5173)"
	@echo ""
	@echo "Starting nix proxy first..."
	@make nix-start &
	@sleep 3
	@echo ""
	@echo "Starting OAuth servers..."
	@make oauth-servers &
	@sleep 2  
	@echo ""
	@echo "Starting SPA development server..."
	@make spa-dev &
	@echo ""
	@echo "✅ All services started!"
	@echo ""
	@echo "Access your application at:"
	@echo "  http://client   - OAuth client (via proxy)"
	@echo "  http://server   - Authorization server (via proxy)"
	@echo "  http://api      - Protected resource (via proxy)"
	@echo "  http://localhost:5173 - SPA development server (direct)"
	@echo ""
	@echo "Press Ctrl+C to stop all services, then run 'make stop' to cleanup"

# Alias for all-dev
start: all-dev

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	@echo "Stopping OAuth servers..."
	@pkill -f "authorizationServer.js\|client.js\|protectedResource.js" 2>/dev/null || true
	@echo "Stopping SPA dev server..."
	@pkill -f "react-router dev" 2>/dev/null || true
	@echo "Stopping nix proxy..."
	@make nix-stop
	@echo "✅ All services stopped"

# Clean up everything
clean:
	@echo "🧹 Cleaning up everything..."
	@make stop
	@make nix-clean
	@echo "✅ Complete cleanup finished"

# Development workflow helpers
dev-oauth:
	@echo "🔐 Starting OAuth servers only..."
	@make oauth-servers

dev-spa:
	@echo "⚛️  Starting SPA development only..."
	@make spa-dev

dev-proxy:
	@echo "🌐 Starting proxy only..."
	@make nix-start
