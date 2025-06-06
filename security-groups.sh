#!/bin/bash

# Configuration
AWS_REGION="us-east-2"
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)

# Get or create ALB Security Group
echo "Setting up ALB Security Group..."
ALB_SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=muckd-alb-sg" \
    --query "SecurityGroups[0].GroupId" \
    --output text)

if [ "$ALB_SG_ID" == "None" ]; then
    echo "Creating ALB Security Group..."
    ALB_SG_ID=$(aws ec2 create-security-group \
        --group-name muckd-alb-sg \
        --description "Security group for Muckd ALB" \
        --vpc-id $VPC_ID \
        --query "GroupId" \
        --output text)
fi

# Allow HTTP inbound to ALB (temporarily using HTTP instead of HTTPS)
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 || true

# Get or create ECS Tasks Security Group
echo "Setting up ECS Tasks Security Group..."
ECS_SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=muckd-ecs-sg" \
    --query "SecurityGroups[0].GroupId" \
    --output text)

if [ "$ECS_SG_ID" == "None" ]; then
    echo "Creating ECS Tasks Security Group..."
    ECS_SG_ID=$(aws ec2 create-security-group \
        --group-name muckd-ecs-sg \
        --description "Security group for Muckd ECS tasks" \
        --vpc-id $VPC_ID \
        --query "GroupId" \
        --output text)
fi

# Allow inbound from ALB to ECS tasks
aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 8000 \
    --source-group $ALB_SG_ID || true

# Allow outbound to RDS
aws ec2 authorize-security-group-egress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 5432 \
    --cidr 0.0.0.0/0 || true

# Allow outbound to Redis
aws ec2 authorize-security-group-egress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 6379 \
    --cidr 0.0.0.0/0 || true

# Allow outbound to S3
aws ec2 authorize-security-group-egress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 || true

# Allow outbound to ECR
aws ec2 authorize-security-group-egress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 || true

# Allow outbound to CloudWatch Logs
aws ec2 authorize-security-group-egress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 || true

# Allow outbound to Systems Manager
aws ec2 authorize-security-group-egress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 || true

echo "Security Groups setup completed!"
echo "ALB Security Group ID: $ALB_SG_ID"
echo "ECS Tasks Security Group ID: $ECS_SG_ID" 