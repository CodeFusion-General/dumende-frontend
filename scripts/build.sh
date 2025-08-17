#!/bin/bash

# Dumende Frontend Build Script
# Usage: ./scripts/build.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Configuration
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
BACKUP_DIR="dist-backup"

log "Starting build process for environment: $ENVIRONMENT"

# Pre-build checks
pre_build_checks() {
    log "Running pre-build checks..."
    
    # Check Node.js version
    local node_version=$(node --version)
    log "Node.js version: $node_version"
    
    if [[ ! "$node_version" =~ ^v18\. ]] && [[ ! "$node_version" =~ ^v20\. ]]; then
        warning "Recommended Node.js version is 18.x or 20.x"
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found"
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log "node_modules not found, installing dependencies..."
        npm ci
    fi
    
    success "Pre-build checks completed"
}

# Set environment variables
set_environment() {
    log "Setting environment variables for: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        development)
            export VITE_API_BASE_URL="http://localhost:8080/api"
            export VITE_APP_ENVIRONMENT="development"
            export VITE_ENABLE_DEBUG_MODE="true"
            export VITE_ENABLE_ANALYTICS="false"
            export VITE_ENABLE_SOURCE_MAP="true"
            ;;
        staging)
            export VITE_API_BASE_URL="https://staging-api.dumende.com/api"
            export VITE_APP_ENVIRONMENT="staging"
            export VITE_ENABLE_DEBUG_MODE="true"
            export VITE_ENABLE_ANALYTICS="false"
            export VITE_ENABLE_SOURCE_MAP="true"
            ;;
        production)
            export VITE_API_BASE_URL="https://api.dumende.com/api"
            export VITE_APP_ENVIRONMENT="production"
            export VITE_ENABLE_DEBUG_MODE="false"
            export VITE_ENABLE_ANALYTICS="true"
            export VITE_ENABLE_SOURCE_MAP="false"
            ;;
        *)
            error "Invalid environment. Use 'development', 'staging', or 'production'"
            ;;
    esac
    
    # Common environment variables
    export VITE_APP_NAME="Dümende"
    export VITE_APP_VERSION=$(node -p "require('./package.json').version")
    export VITE_APP_TITLE="dümende.com - Your yacht rental solution"
    export VITE_API_TIMEOUT="30000"
    export VITE_JWT_STORAGE_KEY="dumende_auth_token"
    export VITE_REFRESH_TOKEN_KEY="dumende_refresh_token"
    export VITE_CHUNK_SIZE_WARNING_LIMIT="1000"
    
    success "Environment variables set for $ENVIRONMENT"
}

# Run tests
run_tests() {
    if [ "$ENVIRONMENT" != "development" ]; then
        log "Running tests..."
        
        # Type checking
        log "Running TypeScript type checking..."
        npx tsc --noEmit
        
        # Linting
        log "Running ESLint..."
        npm run lint || warning "Linting issues found but continuing..."
        
        # Unit tests
        log "Running unit tests..."
        npm run test:run
        
        success "Tests completed"
    else
        log "Skipping tests for development build"
    fi
}

# Backup previous build
backup_build() {
    if [ -d "$BUILD_DIR" ]; then
        log "Backing up previous build..."
        
        if [ -d "$BACKUP_DIR" ]; then
            rm -rf "$BACKUP_DIR"
        fi
        
        mv "$BUILD_DIR" "$BACKUP_DIR"
        success "Previous build backed up to $BACKUP_DIR"
    fi
}

# Build application
build_app() {
    log "Building application for $ENVIRONMENT..."
    
    # Clean any existing build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Run the build
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        error "Build failed - $BUILD_DIR directory not created"
    fi
    
    success "Build completed successfully"
}

# Analyze build
analyze_build() {
    log "Analyzing build output..."
    
    # Check build size
    local build_size=$(du -sh "$BUILD_DIR" | cut -f1)
    log "Total build size: $build_size"
    
    # Check individual chunk sizes
    log "Asset sizes:"
    find "$BUILD_DIR" -name "*.js" -o -name "*.css" | while read file; do
        local size=$(du -h "$file" | cut -f1)
        local filename=$(basename "$file")
        echo "  $filename: $size"
    done
    
    # Check for large chunks
    find "$BUILD_DIR" -name "*.js" -size +500k | while read file; do
        warning "Large JavaScript chunk detected: $(basename "$file")"
    done
    
    # Verify critical files exist
    local critical_files=("index.html" "assets")
    for file in "${critical_files[@]}"; do
        if [ ! -e "$BUILD_DIR/$file" ]; then
            error "Critical file missing: $file"
        fi
    done
    
    success "Build analysis completed"
}

# Generate build report
generate_report() {
    local report_file="build-report-$ENVIRONMENT.json"
    
    log "Generating build report..."
    
    cat > "$report_file" << EOF
{
  "environment": "$ENVIRONMENT",
  "version": "$VITE_APP_VERSION",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "buildSize": "$(du -sb "$BUILD_DIR" | cut -f1)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF
    
    success "Build report generated: $report_file"
}

# Post-build optimization
optimize_build() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Running post-build optimizations..."
        
        # Compress HTML files
        find "$BUILD_DIR" -name "*.html" -exec gzip -k {} \;
        
        # Compress CSS files
        find "$BUILD_DIR" -name "*.css" -exec gzip -k {} \;
        
        # Compress JS files
        find "$BUILD_DIR" -name "*.js" -exec gzip -k {} \;
        
        success "Build optimization completed"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files..."
    
    # Remove backup if build was successful
    if [ -d "$BACKUP_DIR" ] && [ -d "$BUILD_DIR" ]; then
        rm -rf "$BACKUP_DIR"
        log "Backup removed"
    fi
    
    success "Cleanup completed"
}

# Main build process
main() {
    local start_time=$(date +%s)
    
    log "Starting build process..."
    
    pre_build_checks
    set_environment
    run_tests
    backup_build
    build_app
    analyze_build
    generate_report
    optimize_build
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "Build completed successfully in ${duration}s"
    log "Build output available in: $BUILD_DIR"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Production build ready for deployment"
    fi
}

# Run main function
main