# Declares phony targets to prevent conflicts with files named api, idp, web, or e2e
.PHONY: api idp web e2e dev api_dev idp_dev web_dev

api_install:
	cd api && bun install && bun run db:setup

idp_install:
	cd idp && bun install && bun run db:setup

web_install:
	cd web && bun install

install:
	make api_install & make idp_install & make web_install

stop:
	lsof -ti:3000 | xargs kill -9 2>/dev/null; lsof -ti:4000 | xargs kill -9 2>/dev/null; lsof -ti:4001 | xargs kill -9 2>/dev/null; echo "Killed processes on ports 3000, 4000, and 4001"

api:
	cd api && bun start

idp:
	cd idp && bun start

web:
	cd web && bun run dev

start:
	make stop && make idp & make api & make web

e2e:
	bun run --filter e2e test