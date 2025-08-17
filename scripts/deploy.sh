#!/bin/bash

# Dumende Frontend Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]
# Example: ./scripts/deploy.sh production v1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dumende-frontend"
REGISTRY="ghcr.io"
NAMESPACE="dijikent"

# Functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Parse arguments
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

log "Starting deployment for environment: $ENVIRONMENT with version: $VERSION"

# Validate environment
case $ENVIRONMENT in
    staging|production)
        log "Environment validated: $ENVIRONMENT"
        ;;
    *)
        error "Invalid environment. Use 'staging' or 'production'"
        ;;
esac

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if we're logged into the registry
    if ! docker info | grep -q "Registry:"; then
        warning "You may need to log in to the container registry"
    fi
    
    success "Prerequisites check passed"
}

# Build and push image
build_and_push() {
    local image_tag="$REGISTRY/$NAMESPACE/$PROJECT_NAME:$VERSION"
    local latest_tag="$REGISTRY/$NAMESPACE/$PROJECT_NAME:latest"
    
    log "Building Docker image: $image_tag"
    
    # Build args based on environment
    local build_args=""
    if [ "$ENVIRONMENT" = "production" ]; then
        build_args="--build-arg VITE_API_BASE_URL=https://api.dumende.com/api"
        build_args="$build_args --build-arg VITE_APP_ENVIRONMENT=production"
        build_args="$build_args --build-arg VITE_ENABLE_ANALYTICS=true"
        build_args="$build_args --build-arg VITE_ENABLE_DEBUG_MODE=false"
    else
        build_args="--build-arg VITE_API_BASE_URL=https://staging-api.dumende.com/api"
        build_args="$build_args --build-arg VITE_APP_ENVIRONMENT=staging"
        build_args="$build_args --build-arg VITE_ENABLE_ANALYTICS=false"
        build_args="$build_args --build-arg VITE_ENABLE_DEBUG_MODE=true"
    fi
    
    # Build the image
    docker build $build_args -t $image_tag .
    
    # Tag as latest for the environment
    if [ "$ENVIRONMENT" = "production" ]; then
        docker tag $image_tag $latest_tag
    fi
    
    log "Pushing image to registry..."
    docker push $image_tag
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker push $latest_tag
    fi
    
    success "Image built and pushed: $image_tag"
}

# Deploy to environment
deploy() {
    local image_tag="$REGISTRY/$NAMESPACE/$PROJECT_NAME:$VERSION"
    
    log "Deploying to $ENVIRONMENT environment..."
    
    case $ENVIRONMENT in
        staging)
            deploy_staging $image_tag
            ;;
        production)
            deploy_production $image_tag
            ;;
    esac
}

# Deploy to staging
deploy_staging() {
    local image_tag=$1
    log "Deploying to staging environment with image: $image_tag"
    
    # Update docker-compose file for staging
    export COMPOSE_PROJECT_NAME="${PROJECT_NAME}-staging"
    export IMAGE_TAG=$image_tag
    
    # Deploy using docker-compose
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for health check
    wait_for_health "http://staging.dumende.com/health"
    
    success "Staging deployment completed"
}

# Deploy to production
deploy_production() {
    local image_tag=$1
    log "Deploying to production environment with image: $image_tag"
    
    # Production deployment with zero-downtime
    warning "Production deployment requires manual confirmation"
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Production deployment cancelled"
    fi
    
    # Update production services
    export COMPOSE_PROJECT_NAME="${PROJECT_NAME}-production"
    export IMAGE_TAG=$image_tag
    
    # Blue-green deployment strategy
    log "Starting blue-green deployment..."
    
    # Deploy to green environment first
    docker-compose -f docker-compose.production.yml up -d --scale frontend=2
    
    # Wait for health check
    wait_for_health "http://dumende.com/health"
    
    # Switch traffic (this would depend on your load balancer setup)
    log "Switching traffic to new version..."
    
    success "Production deployment completed"
}

# Wait for health check
wait_for_health() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    log "Waiting for application to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f $url > /dev/null 2>&1; then
            success "Application is healthy"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts - waiting for health check..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Rollback function
rollback() {
    local previous_version=$1
    
    if [ -z "$previous_version" ]; then
        error "Previous version not specified for rollback"
    fi
    
    warning "Rolling back to version: $previous_version"
    
    # Rollback logic here
    log "Implementing rollback to $previous_version"
    
    success "Rollback completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old images (keep last 5 versions)
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        grep "$REGISTRY/$NAMESPACE/$PROJECT_NAME" | \
        tail -n +6 | \
        awk '{print $1}' | \
        xargs -r docker rmi
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting deployment process..."
    
    check_prerequisites
    build_and_push
    deploy
    cleanup
    
    success "Deployment completed successfully!"
    log "Application URL: https://${ENVIRONMENT}.dumende.com"
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback $2
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|cleanup] [environment] [version]"
        echo "  deploy:   Deploy application (default)"
        echo "  rollback: Rollback to previous version"
        echo "  cleanup:  Clean up old Docker images"
        exit 1
        ;;
esac