#!/bin/bash
# =============================================================================
# AWS EC2 + EKS Setup Script for Placement Tracker
# Run this on your local machine with AWS CLI configured
# =============================================================================

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
REGION="us-east-1"
CLUSTER_NAME="placement-tracker-cluster"
NODE_TYPE="t3.medium"
NODE_COUNT=3
KEY_NAME="placement-tracker-key"
PROJECT_TAG="placement-tracker"

echo "============================================================"
echo " 🚀 Automated Cloud-Based Placement Tracker — AWS Setup"
echo "============================================================"

# ── Step 1: Create Key Pair ───────────────────────────────────────────────────
echo "📦 [1/8] Creating EC2 Key Pair..."
aws ec2 create-key-pair \
  --key-name "${KEY_NAME}" \
  --query 'KeyMaterial' \
  --output text \
  --region "${REGION}" > "${KEY_NAME}.pem"
chmod 400 "${KEY_NAME}.pem"
echo "✅ Key pair created: ${KEY_NAME}.pem"

# ── Step 2: Create Security Groups ───────────────────────────────────────────
echo "🔒 [2/8] Creating Security Groups..."
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].VpcId" \
  --output text \
  --region "${REGION}")
echo "   Using VPC: ${VPC_ID}"

# Jenkins/SonarQube Security Group
JENKINS_SG=$(aws ec2 create-security-group \
  --group-name "pt-devops-sg" \
  --description "Security group for Jenkins + SonarQube" \
  --vpc-id "${VPC_ID}" \
  --region "${REGION}" \
  --query 'GroupId' \
  --output text)

# Allow ports: SSH, Jenkins 8080, SonarQube 9000
for PORT in 22 8080 9000 50000; do
  aws ec2 authorize-security-group-ingress \
    --group-id "${JENKINS_SG}" \
    --protocol tcp \
    --port "${PORT}" \
    --cidr "0.0.0.0/0" \
    --region "${REGION}"
done
echo "✅ DevOps Security Group: ${JENKINS_SG}"

# App Security Group
APP_SG=$(aws ec2 create-security-group \
  --group-name "pt-app-sg" \
  --description "Security group for app servers" \
  --vpc-id "${VPC_ID}" \
  --region "${REGION}" \
  --query 'GroupId' \
  --output text)

for PORT in 22 80 443 5000 3000; do
  aws ec2 authorize-security-group-ingress \
    --group-id "${APP_SG}" \
    --protocol tcp \
    --port "${PORT}" \
    --cidr "0.0.0.0/0" \
    --region "${REGION}"
done
echo "✅ App Security Group: ${APP_SG}"

# ── Step 3: Launch Jenkins EC2 Instance ──────────────────────────────────────
echo "🖥️  [3/8] Launching Jenkins + SonarQube EC2 instance..."
JENKINS_INSTANCE=$(aws ec2 run-instances \
  --image-id "ami-0c02fb55956c7d316" \
  --instance-type "t3.large" \
  --key-name "${KEY_NAME}" \
  --security-group-ids "${JENKINS_SG}" \
  --region "${REGION}" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=pt-jenkins},{Key=Project,Value=${PROJECT_TAG}}]" \
  --user-data file://devops/scripts/jenkins-install.sh \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "   Instance ID: ${JENKINS_INSTANCE}"
echo "   Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids "${JENKINS_INSTANCE}" --region "${REGION}"

JENKINS_IP=$(aws ec2 describe-instances \
  --instance-ids "${JENKINS_INSTANCE}" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region "${REGION}")
echo "✅ Jenkins instance running at: http://${JENKINS_IP}:8080"

# ── Step 4: Create S3 Bucket ──────────────────────────────────────────────────
echo "🪣  [4/8] Creating S3 bucket for file uploads..."
BUCKET_NAME="placement-tracker-uploads-$(date +%s)"
aws s3api create-bucket \
  --bucket "${BUCKET_NAME}" \
  --region "${REGION}" \
  --create-bucket-configuration LocationConstraint="${REGION}" 2>/dev/null || true

aws s3api put-bucket-versioning \
  --bucket "${BUCKET_NAME}" \
  --versioning-configuration Status=Enabled

aws s3api put-public-access-block \
  --bucket "${BUCKET_NAME}" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "✅ S3 bucket created: ${BUCKET_NAME}"

# ── Step 5: Create EKS Cluster ────────────────────────────────────────────────
echo "☸️  [5/8] Creating EKS cluster (this takes ~15 minutes)..."
eksctl create cluster \
  --name "${CLUSTER_NAME}" \
  --region "${REGION}" \
  --nodegroup-name "pt-nodes" \
  --node-type "${NODE_TYPE}" \
  --nodes "${NODE_COUNT}" \
  --nodes-min 2 \
  --nodes-max 6 \
  --managed \
  --with-oidc \
  --tags "Project=${PROJECT_TAG}"
echo "✅ EKS cluster created: ${CLUSTER_NAME}"

# ── Step 6: Install Nginx Ingress Controller ──────────────────────────────────
echo "🌐 [6/8] Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml
echo "✅ NGINX Ingress Controller installed"

# ── Step 7: Install ArgoCD ────────────────────────────────────────────────────
echo "🔄 [7/8] Installing ArgoCD..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "   Waiting for ArgoCD pods to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

ARGOCD_PASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "✅ ArgoCD installed. Initial password: ${ARGOCD_PASS}"

# ── Step 8: Deploy Application Namespace ─────────────────────────────────────
echo "📦 [8/8] Creating application namespace and applying resources..."
kubectl apply -f k8s/base/all-resources.yaml
kubectl apply -f devops/argocd-application.yaml
echo "✅ Application resources applied"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo " ✅ AWS Setup Complete!"
echo "============================================================"
echo ""
echo " Jenkins:   http://${JENKINS_IP}:8080"
echo " SonarQube: http://${JENKINS_IP}:9000"
echo " EKS:       ${CLUSTER_NAME}"
echo " S3:        ${BUCKET_NAME}"
echo ""
echo " Next Steps:"
echo "  1. Configure Jenkins credentials (Docker Hub, SonarQube, AWS)"
echo "  2. Add Jenkinsfile pipeline from devops/jenkins/Jenkinsfile"
echo "  3. Point your domain to the Ingress Load Balancer"
echo "  4. Install cert-manager for TLS: kubectl apply -f https://..."
echo "  5. Update k8s/base/*.yaml with your Docker Hub username"
echo "============================================================"
