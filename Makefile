# ─── PlaceNova Makefile ───────────────────────────────────────────────────────
DOCKER_USER ?= yourdockerhubuser
TAG         ?= latest

.PHONY: help dev up down build push test seed lint k8s-apply k8s-status logs clean

help:
	@echo ""
	@echo "  PlaceNova — Available Commands"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make dev          Start local dev servers"
	@echo "  make up           Start full Docker Compose stack"
	@echo "  make down         Stop Docker Compose stack"
	@echo "  make build        Build Docker images"
	@echo "  make push         Push images to Docker Hub"
	@echo "  make test         Run backend tests"
	@echo "  make seed         Seed database with demo data"
	@echo "  make lint         Lint backend code"
	@echo "  make k8s-apply    Apply Kubernetes manifests"
	@echo "  make k8s-status   Show K8s pod/service status"
	@echo "  make logs         Tail backend logs"
	@echo "  make clean        Remove containers and volumes"
	@echo ""

dev:
	@echo "🚀 Starting development servers..."
	cd backend && npm install && npm run dev &
	cd frontend && npm install && npm start

up:
	@echo "🐳 Starting full stack..."
	docker-compose up -d
	@echo ""
	@echo "  ✅ App:        http://localhost:3000"
	@echo "  ✅ API:        http://localhost:5000"
	@echo "  ✅ Grafana:    http://localhost:3001  (admin/admin123)"
	@echo "  ✅ Kibana:     http://localhost:5601"
	@echo "  ✅ Prometheus: http://localhost:9090"

down:
	docker-compose down

build:
	@echo "🔨 Building Docker images..."
	docker build -t $(DOCKER_USER)/placenova-backend:$(TAG)  ./backend
	docker build -t $(DOCKER_USER)/placenova-frontend:$(TAG) ./frontend
	@echo "✅ Images built"

push: build
	@echo "📤 Pushing to Docker Hub..."
	docker push $(DOCKER_USER)/placenova-backend:$(TAG)
	docker push $(DOCKER_USER)/placenova-frontend:$(TAG)

test:
	@echo "🧪 Running backend tests..."
	cd backend && npm test -- --coverage --forceExit

seed:
	@echo "🌱 Seeding database..."
	cd backend && node src/utils/seed.js
	@echo ""
	@echo "  Demo accounts:"
	@echo "  coordinator@demo.com / demo123"
	@echo "  student@demo.com     / demo123"

lint:
	cd backend && npm run lint

k8s-apply:
	@echo "☸️  Applying Kubernetes manifests..."
	kubectl apply -f k8s/base/all-resources.yaml
	kubectl apply -f k8s/base/backend-deployment.yaml

k8s-status:
	kubectl get pods,svc,hpa,ingress -n placement-tracker

logs:
	kubectl logs -f deployment/placement-tracker-backend -n placement-tracker

clean:
	@echo "🗑️  Cleaning up..."
	docker-compose down -v --remove-orphans
	@echo "✅ Cleaned"
