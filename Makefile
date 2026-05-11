.PHONY: dev fullstack install seed backend frontend test build lint

dev:
	npm run dev

install:
	npm install

seed:
	npm run seed --workspace backend

backend:
	npm run dev --workspace backend

frontend:
	npm run dev --workspace frontend

test:
	npm run test

build:
	npm run build

lint:
	npm run lint
