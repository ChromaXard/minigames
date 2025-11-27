up:
	docker compose --env-file .env up -d
up-build:
	docker compose --env-file .env up -d --build
down:
	docker compose --env-file .env down
down-volumes:
	docker compose --env-file .env down -v
restart:
	docker compose --env-file .env down
	docker compose --env-file .env up -d
logs:
	docker compose --env-file .env logs -f
ps:
	docker compose --env-file .env ps

.PHONY: up up-build down down-volumes restart logs ps