#!/bin/bash

# Exit on error
set -e

# Configuration
AWS_REGION="us-east-2"  # Change this to your region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="muckd"
CLUSTER_NAME="muckd-cluster"
SERVICE_NAME="muckd-service"

# Login to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repository if it doesn't exist
echo "Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION || \
    aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Build and push Docker image
echo "Building and pushing Docker image..."
docker build -t $ECR_REPOSITORY .
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Update task definitions
echo "Updating task definitions..."

# Create temporary files for task definitions
cp task-definition-web.json task-definition-web-temp.json
cp task-definition-celery.json task-definition-celery-temp.json

# Replace placeholders in task definitions
sed -i '' "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" task-definition-web-temp.json
sed -i '' "s/\${AWS_REGION}/$AWS_REGION/g" task-definition-web-temp.json
sed -i '' "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" task-definition-celery-temp.json
sed -i '' "s/\${AWS_REGION}/$AWS_REGION/g" task-definition-celery-temp.json

# Register new task definitions
echo "Registering new task definitions..."
WEB_TASK_DEF=$(aws ecs register-task-definition --cli-input-json file://task-definition-web-temp.json --region $AWS_REGION)
CELERY_TASK_DEF=$(aws ecs register-task-definition --cli-input-json file://task-definition-celery-temp.json --region $AWS_REGION)

# Get the latest task definition revision
WEB_TASK_REVISION=$(echo $WEB_TASK_DEF | jq -r '.taskDefinition.revision')
CELERY_TASK_REVISION=$(echo $CELERY_TASK_DEF | jq -r '.taskDefinition.revision')

# Check if ECS cluster exists and is ACTIVE
CLUSTER_STATUS=$(aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION | jq -r '.clusters[0].status')
if [ "$CLUSTER_STATUS" == "INACTIVE" ]; then
    echo "Cluster $CLUSTER_NAME is INACTIVE. Deleting and recreating..."
    aws ecs delete-cluster --cluster $CLUSTER_NAME --region $AWS_REGION
    aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION
elif [ "$CLUSTER_STATUS" != "ACTIVE" ]; then
    echo "Cluster $CLUSTER_NAME does not exist. Creating..."
    aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION
else
    echo "Cluster $CLUSTER_NAME is ACTIVE."
fi

# Get the first available AZ
FIRST_AZ=$(aws ec2 describe-availability-zones --region $AWS_REGION --query 'AvailabilityZones[0].ZoneName' --output text)

# Desired CIDR for new subnet
NEW_SUBNET_CIDR="172.31.100.0/24"

# Check if subnet with this CIDR already exists
EXISTING_SUBNET_ID=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-0510026efe0def9dc Name=cidr-block,Values=$NEW_SUBNET_CIDR --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)

if [ "$EXISTING_SUBNET_ID" == "None" ]; then
    # Create the subnet if it doesn't exist
    NEW_SUBNET_ID=$(aws ec2 create-subnet \
        --vpc-id vpc-0510026efe0def9dc \
        --cidr-block $NEW_SUBNET_CIDR \
        --availability-zone $FIRST_AZ \
        --region $AWS_REGION \
        --query 'Subnet.SubnetId' --output text)
    echo "Created new subnet: $NEW_SUBNET_ID"
else
    NEW_SUBNET_ID=$EXISTING_SUBNET_ID
    echo "Using existing subnet: $NEW_SUBNET_ID"
fi

# Create or update services
echo "Creating or updating ECS services..."

# Create web service if it doesn't exist
if ! aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION | grep -q "ACTIVE"; then
    echo "Creating web service..."
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $SERVICE_NAME \
        --task-definition muckd-web:$WEB_TASK_REVISION \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$NEW_SUBNET_ID],securityGroups=[sg-01af35f8816d06005],assignPublicIp=ENABLED}" \
        --region $AWS_REGION
else
    echo "Updating web service..."
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME \
        --task-definition muckd-web:$WEB_TASK_REVISION --force-new-deployment --region $AWS_REGION
fi

# Create celery service if it doesn't exist
if ! aws ecs describe-services --cluster $CLUSTER_NAME --services ${SERVICE_NAME}-celery --region $AWS_REGION | grep -q "ACTIVE"; then
    echo "Creating celery service..."
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name ${SERVICE_NAME}-celery \
        --task-definition muckd-celery:$CELERY_TASK_REVISION \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$NEW_SUBNET_ID],securityGroups=[sg-01af35f8816d06005],assignPublicIp=ENABLED}" \
        --region $AWS_REGION
else
    echo "Updating celery service..."
    aws ecs update-service --cluster $CLUSTER_NAME --service ${SERVICE_NAME}-celery \
        --task-definition muckd-celery:$CELERY_TASK_REVISION --force-new-deployment --region $AWS_REGION
fi

# Clean up temporary files
rm task-definition-web-temp.json task-definition-celery-temp.json

echo "Deployment completed successfully!" 