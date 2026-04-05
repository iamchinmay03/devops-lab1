#!/bin/bash
# =============================================================================
# Jenkins + SonarQube + Docker + Trivy EC2 Bootstrap Script
# Used as EC2 UserData — runs automatically on instance launch
# =============================================================================

set -euo pipefail
exec > /var/log/userdata.log 2>&1

echo "🚀 Starting DevOps toolchain installation..."

# ── System Updates ─────────────────────────────────────────────────────────
yum update -y
yum install -y git curl wget unzip java-17-amazon-corretto

# ── Docker ────────────────────────────────────────────────────────────────────
echo "📦 Installing Docker..."
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user
usermod -aG docker jenkins

# ── Docker Compose ────────────────────────────────────────────────────────────
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── Jenkins ───────────────────────────────────────────────────────────────────
echo "📦 Installing Jenkins..."
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install -y jenkins
systemctl enable jenkins
systemctl start jenkins
echo "✅ Jenkins started on port 8080"

# ── SonarQube (via Docker) ────────────────────────────────────────────────────
echo "📦 Starting SonarQube..."
sysctl -w vm.max_map_count=524288
sysctl -w fs.file-max=131072
echo "vm.max_map_count=524288" >> /etc/sysctl.conf

docker run -d \
  --name sonarqube \
  --restart always \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:10.3-community
echo "✅ SonarQube started on port 9000"

# ── Trivy ─────────────────────────────────────────────────────────────────────
echo "📦 Installing Trivy..."
TRIVY_VERSION=$(curl -s "https://api.github.com/repos/aquasecurity/trivy/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
wget -qO- "https://github.com/aquasecurity/trivy/releases/download/${TRIVY_VERSION}/trivy_${TRIVY_VERSION#v}_Linux-64bit.tar.gz" | tar -xz -C /usr/local/bin trivy
echo "✅ Trivy $(trivy --version) installed"

# ── kubectl ───────────────────────────────────────────────────────────────────
echo "📦 Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
echo "✅ kubectl $(kubectl version --client --short) installed"

# ── ArgoCD CLI ────────────────────────────────────────────────────────────────
echo "📦 Installing ArgoCD CLI..."
ARGOCD_VERSION=$(curl -s https://api.github.com/repos/argoproj/argo-cd/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
curl -sSL -o /usr/local/bin/argocd "https://github.com/argoproj/argo-cd/releases/download/${ARGOCD_VERSION}/argocd-linux-amd64"
chmod +x /usr/local/bin/argocd
echo "✅ ArgoCD CLI installed"

# ── Node.js (for SonarScanner) ────────────────────────────────────────────────
echo "📦 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
npm install -g sonar-scanner
echo "✅ Node.js $(node -v) installed"

# ── Wait and print initial Jenkins password ───────────────────────────────────
sleep 30
echo ""
echo "============================================================"
echo " ✅ DevOps Toolchain Installation Complete!"
echo "============================================================"
echo " Jenkins initial password:"
cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo " (Not yet available — wait ~1 min)"
echo ""
echo " Services:"
echo "   Jenkins:   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "   SonarQube: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9000"
echo "============================================================"
