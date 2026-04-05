# PlaceNova — SRM Placement Hub

**Automated Cloud-Based Placement Tracker using CI/CD**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-68A063?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?logo=kubernetes)](https://kubernetes.io)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins)](https://jenkins.io)

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yourusername/placement-tracker.git
cd placement-tracker

# 2. Configure
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET at minimum

# 3. Start full stack
docker-compose up -d

# 4. Seed demo data
docker-compose exec backend node src/utils/seed.js

# 5. Open
open http://localhost:3000
```

**Demo accounts:**
| Role | Email | Password |
|------|-------|----------|
| Coordinator | coordinator@demo.com | demo123 |
| Student | student@demo.com | demo123 |

---

## 📐 Architecture

```
Developer → GitHub → Jenkins CI/CD Pipeline
  → Install deps → Tests → SonarQube → Trivy
  → Docker Build → Push to Hub → Update K8s manifests
  → ArgoCD GitOps → AWS EKS → Live
```

## 🛠️ Tech Stack

**Frontend:** React 18, Tailwind CSS, Zustand, Chart.js  
**Backend:** Node.js 20, Express, JWT, bcrypt  
**Database:** MongoDB 7 (Mongoose)  
**DevOps:** Jenkins, Docker, Kubernetes, ArgoCD, SonarQube, Trivy  
**Cloud:** AWS (EC2 + EKS + S3), Vercel  
**Monitoring:** Prometheus, Grafana, ELK Stack  
**New:** GitHub, Terraform, Ansible

## 📖 Full Deployment Guide

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete step-by-step instructions covering:
- Local Development
- Docker Full Stack
- AWS EC2 (Jenkins + SonarQube)
- AWS EKS Kubernetes
- Jenkins CI/CD Pipeline
- SonarQube Integration
- ArgoCD GitOps
- Vercel Frontend Deployment
- Prometheus + Grafana + ELK Monitoring

## 📁 Project Structure

```
placenova/
├── frontend/          React.js + Tailwind CSS
├── backend/           Node.js + Express API
├── k8s/               Kubernetes manifests + Kustomize overlays
├── devops/            Jenkinsfile, ArgoCD, AWS scripts
├── monitoring/        Prometheus, Grafana, ELK configs
└── docs/              Deployment guide, Architecture decisions
```

## 🌐 Service URLs (local)

| Service | URL | Login |
|---------|-----|-------|
| App | http://localhost:3000 | demo accounts above |
| API | http://localhost:5000/api | — |
| Grafana | http://localhost:3001 | admin/admin123 |
| Kibana | http://localhost:5601 | — |
| Prometheus | http://localhost:9090 | — |

---

© 2024 PlaceNova — SRM Institute of Science & Technology
