#!/bin/bash

# Exit on error
set -e

# Configuration
AWS_REGION="us-east-2"
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[?MapPublicIpOnLaunch==\`true\`].SubnetId" --output text | tr '\t' ',')
ALB_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=muckd-alb-sg" --query "SecurityGroups[0].GroupId" --output text)
ECS_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=muckd-ecs-sg" --query "SecurityGroups[0].GroupId" --output text)

# Get or create ALB
echo "Setting up Application Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names muckd-alb --query "LoadBalancers[0].LoadBalancerArn" --output text 2>/dev/null || echo "None")

if [ "$ALB_ARN" == "None" ]; then
    echo "Creating Application Load Balancer..."
    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name muckd-alb \
        --subnets $SUBNET_IDS \
        --security-groups $ALB_SG_ID \
        --scheme internet-facing \
        --type application \
        --query "LoadBalancers[0].LoadBalancerArn" \
        --output text)
fi

# Get or create target group
echo "Setting up target group..."
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names muckd-tg --query "TargetGroups[0].TargetGroupArn" --output text 2>/dev/null || echo "None")

if [ "$TARGET_GROUP_ARN" == "None" ]; then
    echo "Creating target group..."
    TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
        --name muckd-tg \
        --protocol HTTP \
        --port 8000 \
        --vpc-id $VPC_ID \
        --target-type ip \
        --health-check-path /health/ \
        --health-check-interval-seconds 30 \
        --health-check-timeout-seconds 5 \
        --healthy-threshold-count 2 \
        --unhealthy-threshold-count 2 \
        --query "TargetGroups[0].TargetGroupArn" \
        --output text)
fi

# Get or create HTTP listener
echo "Setting up HTTP listener..."
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query "Listeners[0].ListenerArn" --output text 2>/dev/null || echo "None")

if [ "$LISTENER_ARN" == "None" ]; then
    echo "Creating HTTP listener..."
    LISTENER_ARN=$(aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
        --query "Listeners[0].ListenerArn" \
        --output text)
fi

# Create ECS cluster if it doesn't exist
echo "Setting up ECS cluster..."
aws ecs create-cluster --cluster-name muckd-cluster || true

# Get or create web service
echo "Setting up web service..."
WEB_SERVICE=$(aws ecs describe-services --cluster muckd-cluster --services muckd-service --query "services[0].status" --output text 2>/dev/null || echo "None")

if [ "$WEB_SERVICE" == "None" ]; then
    echo "Creating web service..."
    aws ecs create-service \
        --cluster muckd-cluster \
        --service-name muckd-service \
        --task-definition muckd-web:1 \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS%,*}],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=muckd-web,containerPort=8000"
fi

# Get or create Celery service
echo "Setting up Celery service..."
CELERY_SERVICE=$(aws ecs describe-services --cluster muckd-cluster --services muckd-service-celery --query "services[0].status" --output text 2>/dev/null || echo "None")

if [ "$CELERY_SERVICE" == "None" ]; then
    echo "Creating Celery service..."
    aws ecs create-service \
        --cluster muckd-cluster \
        --service-name muckd-service-celery \
        --task-definition muckd-celery:1 \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS%,*}],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}"
fi

echo "Infrastructure setup completed!"
echo "ALB DNS Name: $(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)" 