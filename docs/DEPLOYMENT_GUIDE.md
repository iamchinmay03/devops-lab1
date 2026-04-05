# PlaceNova — Complete Deployment & Setup Guide

**Automated Cloud-Based Placement Tracker using CI/CD**  
SRM Institute of Science & Technology

---

## 📁 A. Complete Project Folder Structure

```
placenova/
├── frontend/                         # React.js application
│   ├── public/
│   │   ├── index.html                # HTML shell with favicon ref
│   │   └── favicon.svg               # PlaceNova favicon (SVG)
│   ├── src/
│   │   ├── assets/
│   │   │   ├── placenova-logo.svg    # Full logo SVG
│   │   │   └── placenova-favicon.svg # Favicon SVG
│   │   ├── components/
│   │   │   └── shared/
│   │   │       └── Sidebar.js        # Shared sidebar component
│   │   ├── context/
│   │   │   └── authStore.js          # Zustand auth state
│   │   ├── pages/
│   │   │   ├── LandingPage.js        # ★ Main landing page
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── NotFound.js
│   │   │   ├── student/
│   │   │   │   ├── StudentLayout.js
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── StudentCompanies.js
│   │   │   │   ├── StudentApplications.js
│   │   │   │   └── StudentProfile.js
│   │   │   └── coordinator/
│   │   │       ├── CoordLayout.js
│   │   │       ├── CoordDashboard.js
│   │   │       ├── CoordStudents.js
│   │   │       ├── CoordCompanies.js
│   │   │       ├── CoordApplications.js
│   │   │       └── CoordAddCompany.js
│   │   ├── utils/
│   │   │   └── api.js                # Axios instance + interceptors
│   │   ├── App.js                    # React Router setup
│   │   ├── index.js                  # React entry
│   │   └── index.css                 # Global styles + Tailwind
│   ├── Dockerfile                    # Production: multi-stage + nginx
│   ├── Dockerfile.dev                # Dev: CRA hot-reload
│   ├── nginx.conf                    # SPA routing + API proxy
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                   # Vercel deployment config
│   └── netlify.toml                  # Netlify config
│
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── companyController.js
│   │   │   ├── applicationController.js
│   │   │   └── dashboardController.js
│   │   ├── models/
│   │   │   ├── User.js               # Student + Coordinator schema
│   │   │   ├── Company.js
│   │   │   └── Application.js        # With status timeline
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── student.js
│   │   │   ├── company.js
│   │   │   ├── application.js
│   │   │   └── dashboard.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT protect + authorize
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js             # Prometheus metrics middleware
│   │   ├── config/
│   │   │   └── logger.js             # Winston logger
│   │   ├── utils/
│   │   │   └── seed.js               # Demo data seeder
│   │   └── server.js                 # Express app entry
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── company.test.js
│   ├── Dockerfile
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── jest.config.js
│   └── package.json
│
├── k8s/
│   ├── base/
│   │   ├── backend-deployment.yaml   # Backend K8s deployment
│   │   └── all-resources.yaml        # All K8s resources (ns, svc, ingress, hpa, secrets)
│   └── overlays/
│       ├── prod/
│       │   └── kustomization.yaml    # Production overlay (3 replicas)
│       └── dev/
│           └── kustomization.yaml    # Dev overlay (1 replica)
│
├── devops/
│   ├── jenkins/
│   │   └── Jenkinsfile               # 11-stage CI/CD pipeline
│   ├── sonarqube/
│   │   └── sonar-project.properties
│   ├── scripts/
│   │   ├── aws-setup.sh              # Full AWS provisioning script
│   │   ├── jenkins-install.sh        # EC2 UserData bootstrap
│   │   └── check-prereqs.sh          # Pre-flight check
│   ├── argocd-application.yaml       # ArgoCD app manifest
│   └── mongo-init.js                 # MongoDB init script
│
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   ├── alerts.yml
│   │   └── alertmanager.yml
│   ├── grafana/
│   │   └── provisioning/
│   │       ├── datasources/
│   │       │   └── datasources.yml
│   │       └── dashboards/
│   │           ├── dashboard.yml
│   │           └── placetrack.json   # Pre-built Grafana dashboard
│   └── elk/
│       ├── logstash.conf
│       └── kibana-setup.sh
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md           # ← This file
│   └── ARCHITECTURE_DECISIONS.md
│
├── docker-compose.yml                # Full stack (8 services)
├── docker-compose.dev.yml            # Dev hot-reload override
├── Makefile                          # Common dev commands
├── .gitignore
└── README.md
```

---

## 📦 B. All Dependencies

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.1.1",
    "axios": "^1.6.5",
    "chart.js": "^4.4.1",
    "date-fns": "^3.3.1",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.21.3",
    "react-scripts": "5.0.1",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1"
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0",
    "prom-client": "^15.1.0",
    "winston": "^3.11.0",
    "xss-clean": "^0.1.4"
  },
  "devDependencies": {
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  }
}
```

---

## 🖥️ C. Step-by-Step Setup Commands

---

### C1. Local Development Setup

> **Run all commands in VS Code Terminal (Ctrl+`)**

#### Step 1 — Check prerequisites
```bash
# VS Code Terminal
node --version       # Expected: v20.x.x
npm --version        # Expected: 10.x.x
docker --version     # Expected: Docker version 24+
git --version        # Expected: git version 2.x
```

#### Step 2 — Clone and configure
```bash
# VS Code Terminal
git clone https://github.com/yourusername/placement-tracker.git
cd placement-tracker

# Configure backend environment
cp backend/.env.example backend/.env
```

Open `backend/.env` and set:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/placement_tracker
JWT_SECRET=placenova_super_secret_jwt_key_at_least_32_characters
JWT_REFRESH_SECRET=placenova_refresh_secret_key_min_32_chars
FRONTEND_URL=http://localhost:3000
```

#### Step 3 — Start Backend (Terminal 1)
```bash
# VS Code Terminal 1
cd backend
npm install
npm run dev
```
**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000 in development mode
```

#### Step 4 — Start Frontend (Terminal 2)
```bash
# VS Code Terminal 2 (Ctrl+Shift+` to open new terminal)
cd frontend
npm install
npm start
```
**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

#### Step 5 — Seed demo data (Terminal 3)
```bash
# VS Code Terminal 3 (open new terminal)
cd backend
node src/utils/seed.js
```
**Expected output:**
```
✅ MongoDB connected
✅ Coordinator created: coordinator@demo.com
✅ Created 6 students
✅ Created 5 companies
🎉 Database seeded successfully!
```

**Access:** http://localhost:3000  
| Role | Email | Password |
|------|-------|----------|
| Coordinator | coordinator@demo.com | demo123 |
| Student | student@demo.com | demo123 |

---

### C2. Docker Full Stack Setup

> **Prerequisite:** Docker Desktop running (check system tray)

```bash
# VS Code Terminal (project root)
# Start full stack — backend, frontend, MongoDB, Prometheus, Grafana, ELK
docker-compose up -d

# Verify all containers are healthy
docker-compose ps
```
**Expected output:**
```
pt-backend     Up (healthy)   0.0.0.0:5000->5000/tcp
pt-frontend    Up             0.0.0.0:3000->80/tcp
pt-mongodb     Up (healthy)   0.0.0.0:27017->27017/tcp
pt-prometheus  Up             0.0.0.0:9090->9090/tcp
pt-grafana     Up             0.0.0.0:3001->3000/tcp
pt-kibana      Up             0.0.0.0:5601->5601/tcp
```

```bash
# Seed the database inside Docker
docker-compose exec backend node src/utils/seed.js

# View backend logs in real-time
docker-compose logs -f backend

# Stop all services (keep data volumes)
docker-compose down

# Stop and DELETE all data
docker-compose down -v
```

---

### C3. AWS EC2 — Jenkins + SonarQube Setup

> **Run all AWS CLI commands in:**
> - **Windows:** PowerShell or CMD
> - **Mac/Linux:** Terminal

#### Step 1 — Install AWS CLI

**Windows (PowerShell as Administrator):**
```powershell
# Download and install from:
# https://awscli.amazonaws.com/AWSCLIV2.msi
# Then verify:
aws --version
```

**Mac:**
```bash
# Terminal
brew install awscli
aws --version
```

**Ubuntu/Linux:**
```bash
# Ubuntu Terminal
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```
**Expected:** `aws-cli/2.x.x Python/3.x.x ...`

#### Step 2 — Configure AWS credentials

```bash
# Any Terminal (Windows/Mac/Linux)
aws configure
```
Enter when prompted:
- AWS Access Key ID: `YOUR_ACCESS_KEY`
- AWS Secret Access Key: `YOUR_SECRET_KEY`
- Default region: `us-east-1`
- Output format: `json`

```bash
# Verify
aws sts get-caller-identity
```
**Expected:**
```json
{
    "UserId": "AIDAXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-user"
}
```

#### Step 3 — Create Key Pair

```bash
# Terminal (Windows/Mac/Linux)
aws ec2 create-key-pair \
  --key-name placenova-key \
  --query 'KeyMaterial' \
  --output text \
  --region us-east-1 > placenova-key.pem

# Mac/Linux only — set correct permissions
chmod 400 placenova-key.pem

# Windows PowerShell only
icacls placenova-key.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

#### Step 4 — Create Security Group

```bash
# Terminal
# Get default VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].VpcId" \
  --output text --region us-east-1)

echo "VPC: $VPC_ID"

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name placenova-devops-sg \
  --description "PlaceNova Jenkins SonarQube" \
  --vpc-id $VPC_ID \
  --region us-east-1 \
  --query 'GroupId' --output text)

echo "SG: $SG_ID"

# Open required ports
for PORT in 22 8080 9000 50000; do
  aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID --protocol tcp --port $PORT \
    --cidr 0.0.0.0/0 --region us-east-1
done
echo "✅ Security group configured"
```

#### Step 5 — Launch EC2 Instance

```bash
# Terminal
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.large \
  --key-name placenova-key \
  --security-group-ids $SG_ID \
  --region us-east-1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=placenova-jenkins}]' \
  --user-data file://devops/scripts/jenkins-install.sh \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
  --query 'Instances[0].InstanceId' --output text)

echo "Instance: $INSTANCE_ID"
echo "Waiting for instance to start (~2 min)..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region us-east-1

JENKINS_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text --region us-east-1)

echo "✅ Jenkins:   http://$JENKINS_IP:8080"
echo "✅ SonarQube: http://$JENKINS_IP:9000"
```

#### Step 6 — SSH into EC2 and get Jenkins password

```bash
# Wait 5 min after launch, then:
ssh -i placenova-key.pem ec2-user@$JENKINS_IP

# Inside EC2 — Ubuntu Terminal:
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
**Expected:** A random string like `a7f3b2c1d4e5...`

---

### C4. AWS EKS — Kubernetes Cluster

#### Step 1 — Install eksctl

**Mac:**
```bash
# Terminal
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl
eksctl version
```

**Linux/Ubuntu:**
```bash
# Ubuntu Terminal
curl --silent --location \
  "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" \
  | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version
```

**Windows (PowerShell as Admin):**
```powershell
choco install eksctl
eksctl version
```
**Expected:** `0.170.0` or newer

#### Step 2 — Install kubectl

**Mac:**
```bash
brew install kubectl
kubectl version --client
```

**Linux:**
```bash
# Ubuntu Terminal
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

**Windows:**
```powershell
choco install kubernetes-cli
kubectl version --client
```

#### Step 3 — Create EKS Cluster

> ⚠️ This takes **15-20 minutes**. Do NOT close terminal.

```bash
# Terminal
eksctl create cluster \
  --name placenova-cluster \
  --region us-east-1 \
  --nodegroup-name placenova-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 6 \
  --managed \
  --with-oidc \
  --tags "Project=placenova,App=placement-tracker"
```
**Expected (after 15-20 min):**
```
✅  EKS cluster "placenova-cluster" in "us-east-1" region is ready
```

#### Step 4 — Configure kubectl

```bash
# Terminal
aws eks update-kubeconfig \
  --name placenova-cluster \
  --region us-east-1

# Verify
kubectl get nodes
```
**Expected:**
```
NAME                           STATUS   ROLES    AGE
ip-192-168-1-100.ec2.internal  Ready    <none>   2m
ip-192-168-1-101.ec2.internal  Ready    <none>   2m
ip-192-168-1-102.ec2.internal  Ready    <none>   2m
```

#### Step 5 — Install NGINX Ingress Controller

```bash
# Terminal
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Wait for readiness (~2 min)
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo "✅ NGINX Ingress ready"
```

#### Step 6 — Install cert-manager (HTTPS/TLS)

```bash
# Terminal
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Wait ~2 min
kubectl get pods -n cert-manager
```

#### Step 7 — Deploy PlaceNova to Kubernetes

```bash
# Terminal (update YAML files with your Docker Hub username first!)
# Edit k8s/base/backend-deployment.yaml — replace 'yourdockerhubuser'
# Edit k8s/base/all-resources.yaml     — replace 'yourdockerhubuser'

kubectl create namespace placement-tracker
kubectl apply -f k8s/base/all-resources.yaml
kubectl apply -f k8s/base/backend-deployment.yaml

# Watch pods start
kubectl get pods -n placement-tracker --watch
```
**Expected:**
```
placement-tracker-backend-xxx   1/1   Running   0
placement-tracker-frontend-xxx  1/1   Running   0
mongodb-0                        1/1   Running   0
```

#### Step 8 — Get LoadBalancer URL

```bash
# Terminal
kubectl get svc -n ingress-nginx ingress-nginx-controller
# Note the EXTERNAL-IP
# Point DNS: A record → placetrack.yourdomain.com → EXTERNAL-IP
```

---

### C5. Jenkins CI/CD Pipeline Configuration

#### Install Plugins
Go to: **Jenkins → Manage Jenkins → Plugins → Available plugins**

Search and install:
- Pipeline
- Git Integration
- Docker Pipeline
- SonarQube Scanner
- HTML Publisher
- Credentials Binding
- Workspace Cleanup

Then: **Restart Jenkins**

#### Add Credentials
**Jenkins → Manage Jenkins → Credentials → Global → Add Credential**

| ID | Kind | Value |
|----|------|-------|
| `DOCKER_HUB_USERNAME` | Secret text | Your Docker Hub username |
| `DOCKER_HUB_PASSWORD` | Secret text | Your Docker Hub Access Token |
| `SONAR_TOKEN` | Secret text | SonarQube project token |
| `ARGOCD_SERVER` | Secret text | ArgoCD server URL |
| `ARGOCD_TOKEN` | Secret text | ArgoCD API token |
| `github-credentials` | Username + Password | GitHub username + PAT |

#### Create Pipeline
1. **New Item** → Name: `placenova-pipeline` → **Pipeline**
2. **Build Triggers**: ✅ GitHub hook trigger for GITScm polling
3. **Pipeline**:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repo URL: `https://github.com/yourusername/placement-tracker`
   - Credentials: `github-credentials`
   - Branch: `*/main`
   - Script Path: `devops/jenkins/Jenkinsfile`
4. **Save** → **Build Now**

#### GitHub Webhook
**GitHub Repo → Settings → Webhooks → Add webhook**
- Payload URL: `http://<JENKINS_IP>:8080/github-webhook/`
- Content type: `application/json`
- Events: Just the push event ✅

---

### C6. SonarQube Integration

```
1. Open http://<EC2_IP>:9000
2. Login: admin / admin (change immediately!)
3. Create Project → Manually
   Project key: placement-tracker-backend
4. My Account → Security → Generate Token
   Name: jenkins-token → Generate → COPY IT
5. Add token to Jenkins as SONAR_TOKEN credential

Jenkins → Manage Jenkins → Configure System → SonarQube Servers:
   Name: SonarQube
   URL:  http://<EC2_IP>:9000
   Token: SONAR_TOKEN credential

SonarQube → Administration → Webhooks → Create:
   Name: Jenkins
   URL:  http://<JENKINS_IP>:8080/sonarqube-webhook/
```

---

### C7. ArgoCD GitOps Setup

```bash
# Terminal (kubectl pointing to EKS)
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait ~3 min
kubectl wait --for=condition=available --timeout=300s \
  deployment/argocd-server -n argocd

# Get initial password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo

# Port-forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8081:443
# Open: https://localhost:8081  (admin + password above)
```

**Install ArgoCD CLI:**
```bash
# Mac
brew install argocd

# Linux
curl -sSL -o /usr/local/bin/argocd \
  https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd

# Login
argocd login localhost:8081 --username admin --password <PASSWORD> --insecure
```

**Connect repo and deploy:**
```bash
# Terminal
# In ArgoCD UI: Settings → Repositories → Connect HTTPS
# URL: https://github.com/yourusername/placement-tracker
# Add GitHub PAT credentials

kubectl apply -f devops/argocd-application.yaml

# Generate Jenkins token
argocd account generate-token --account admin
# Add as ARGOCD_TOKEN in Jenkins
```

---

### D. Frontend Deployment (Vercel)

```bash
# VS Code Terminal
npm install -g vercel

cd frontend
vercel login    # Follow browser auth

vercel --prod
```
**Answer prompts:**
```
Set up and deploy? Y
Which scope? → your account
Link to existing project? N
Project name? → placenova-frontend
Root directory? → ./ (Enter)
Override settings? N
```
**Expected:** `✅ Production: https://placenova-frontend.vercel.app`

**Set environment variable:**
```bash
vercel env add REACT_APP_API_URL production
# Value: https://api.placetrack.yourdomain.com/api
```

---

### E. Monitoring Setup

#### E1 — Prometheus + Grafana

```bash
# Already included in docker-compose up -d
# Access Prometheus: http://localhost:9090
# Access Grafana:    http://localhost:3001  (admin/admin123)

# Test PromQL query in Prometheus:
# placement_tracker_http_requests_total

# Grafana dashboards auto-provisioned from:
# monitoring/grafana/provisioning/dashboards/placetrack.json
```

**Key PromQL queries:**
```promql
# Request rate
rate(placement_tracker_http_requests_total[5m])

# Error rate
rate(placement_tracker_http_requests_total{status_code=~"5.."}[5m])

# P95 latency
histogram_quantile(0.95, rate(placement_tracker_http_request_duration_seconds_bucket[5m]))

# Memory
process_resident_memory_bytes/1024/1024
```

#### E2 — ELK Stack

```bash
# ELK auto-starts with docker-compose
# Kibana: http://localhost:5601  (wait 3 min after start)

# Setup index pattern:
# Management → Stack Management → Index Patterns → Create
# Pattern: placement-tracker-logs-*
# Time field: @timestamp

# Run setup script
chmod +x monitoring/elk/kibana-setup.sh
./monitoring/elk/kibana-setup.sh
```

---

## 🌐 F. Service URLs & Default Credentials

### Local Development
| Service | URL | Credentials |
|---------|-----|-------------|
| App (Frontend) | http://localhost:3000 | coordinator@demo.com / demo123 |
| API (Backend) | http://localhost:5000/api | — |
| Health Check | http://localhost:5000/health | — |
| API Metrics | http://localhost:5000/metrics | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | admin / admin123 |
| Kibana | http://localhost:5601 | — |
| Elasticsearch | http://localhost:9200 | — |

### AWS Production
| Service | URL | Credentials |
|---------|-----|-------------|
| Jenkins | http://`<EC2_IP>`:8080 | Set during setup |
| SonarQube | http://`<EC2_IP>`:9000 | admin / (changed) |
| ArgoCD | https://localhost:8081 (port-fwd) | admin / (from secret) |
| App (K8s) | https://placetrack.yourdomain.com | Register new account |

---

## 🔧 G. Troubleshooting

### Backend: MongoDB ECONNREFUSED
```bash
# Start MongoDB
mongod --dbpath /data/db            # Mac/Linux
net start MongoDB                    # Windows

# OR use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### Frontend: CORS error
```bash
# Verify backend/.env
FRONTEND_URL=http://localhost:3000   # No trailing slash!

# Verify frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

### Jenkins: Docker permission denied
```bash
# SSH into EC2, then:
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
sudo systemctl restart docker
```

### K8s: CrashLoopBackOff
```bash
kubectl describe pod <pod-name> -n placement-tracker
kubectl logs <pod-name> -n placement-tracker --previous

# Fix secrets (must be base64 encoded)
echo -n 'your-value' | base64
kubectl edit secret placement-tracker-secrets -n placement-tracker
```

### SonarQube: Quality Gate failing
```bash
# Check test coverage
cd backend && npm test -- --coverage
# Open: backend/coverage/lcov-report/index.html
```

### ⚠️ Cost Warning
```bash
# EKS + EC2 costs ~$8-15/day. Delete after demo:
eksctl delete cluster --name placenova-cluster --region us-east-1
aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region us-east-1
```
