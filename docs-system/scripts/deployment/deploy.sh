#!/bin/bash
set -e

# Documentation System Deployment Script
# This script automates the deployment process for the Documentation System

# Check if environment argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <environment>"
  echo "Environments: development, staging, production"
  exit 1
fi

# Set environment
ENVIRONMENT=$1
echo "Deploying to $ENVIRONMENT environment..."

# Check if we have required environment variables
if [ -z "$DEPLOY_TOKEN" ]; then
  echo "ERROR: Missing DEPLOY_TOKEN environment variable"
  exit 1
fi

# Base directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../" && pwd)"
DIST_DIR="$PROJECT_ROOT/dist"
CONFIG_DIR="$PROJECT_ROOT/config"

# Load environment-specific configuration
ENV_CONFIG="$CONFIG_DIR/$ENVIRONMENT.env"
if [ -f "$ENV_CONFIG" ]; then
  echo "Loading environment configuration from $ENV_CONFIG"
  source "$ENV_CONFIG"
else
  echo "WARNING: Environment config file not found at $ENV_CONFIG"
fi

# Ensure dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Distribution directory not found at $DIST_DIR"
  exit 1
fi

# Deployment functions for different environments
function deploy_to_development() {
  echo "Deploying to development server..."
  # Example: Deploy to local development environment
  rsync -avz --delete "$DIST_DIR/" "$DEV_SERVER_USER@$DEV_SERVER_HOST:$DEV_SERVER_PATH"
  
  echo "Running database migrations..."
  ssh "$DEV_SERVER_USER@$DEV_SERVER_HOST" "cd $DEV_SERVER_PATH && npm run db:migrate"
  
  echo "Restarting services..."
  ssh "$DEV_SERVER_USER@$DEV_SERVER_HOST" "cd $DEV_SERVER_PATH && pm2 restart docs-system-dev"
}

function deploy_to_staging() {
  echo "Deploying to staging server..."
  # Example: Deploy to staging environment using cloud deployment
  
  # Package the application
  echo "Packaging application for staging..."
  tar -czf "$PROJECT_ROOT/docs-system-staging.tar.gz" -C "$DIST_DIR" .
  
  # Upload to cloud storage
  echo "Uploading deployment package..."
  curl -X PUT \
    -H "Authorization: Bearer $DEPLOY_TOKEN" \
    -H "Content-Type: application/gzip" \
    --data-binary "@$PROJECT_ROOT/docs-system-staging.tar.gz" \
    "$STAGING_DEPLOY_ENDPOINT/upload"
  
  # Trigger deployment
  echo "Triggering deployment process..."
  curl -X POST \
    -H "Authorization: Bearer $DEPLOY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"package\": \"docs-system-staging.tar.gz\", \"environment\": \"staging\"}" \
    "$STAGING_DEPLOY_ENDPOINT/deploy"
  
  # Clean up
  rm "$PROJECT_ROOT/docs-system-staging.tar.gz"
}

function deploy_to_production() {
  echo "Deploying to production server..."
  # Example: Deploy to production environment using cloud deployment
  
  # Package the application
  echo "Packaging application for production..."
  tar -czf "$PROJECT_ROOT/docs-system-production.tar.gz" -C "$DIST_DIR" .
  
  # Upload to cloud storage
  echo "Uploading deployment package..."
  curl -X PUT \
    -H "Authorization: Bearer $DEPLOY_TOKEN" \
    -H "Content-Type: application/gzip" \
    --data-binary "@$PROJECT_ROOT/docs-system-production.tar.gz" \
    "$PRODUCTION_DEPLOY_ENDPOINT/upload"
  
  # Trigger deployment
  echo "Triggering deployment process..."
  curl -X POST \
    -H "Authorization: Bearer $DEPLOY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"package\": \"docs-system-production.tar.gz\", \"environment\": \"production\"}" \
    "$PRODUCTION_DEPLOY_ENDPOINT/deploy"
  
  # Clean up
  rm "$PROJECT_ROOT/docs-system-production.tar.gz"
}

# Pre-deployment tasks
echo "Running pre-deployment tasks..."
# Add any pre-deployment tasks here (e.g., backing up data)

# Deploy to selected environment
case "$ENVIRONMENT" in
  development)
    deploy_to_development
    ;;
  staging)
    deploy_to_staging
    ;;
  production)
    deploy_to_production
    ;;
  *)
    echo "ERROR: Unknown environment '$ENVIRONMENT'"
    exit 1
    ;;
esac

# Post-deployment tasks
echo "Running post-deployment tasks..."
# Add any post-deployment tasks here (e.g., invalidating caches)

# Report deployment status
case "$ENVIRONMENT" in
  development)
    echo "Development deployment completed successfully!"
    echo "Application available at: http://$DEV_SERVER_HOST:$DEV_SERVER_PORT"
    ;;
  staging)
    echo "Staging deployment completed successfully!"
    echo "Application available at: https://$STAGING_URL"
    ;;
  production)
    echo "Production deployment completed successfully!"
    echo "Application available at: https://$PRODUCTION_URL"
    ;;
esac

echo "Deployment completed at $(date)"
exit 0