#!/bin/bash

# Health Check Script for Dumende Frontend
# Usage: ./scripts/health-check.sh [url]

set -e

# Configuration
URL=${1:-http://localhost:80}
TIMEOUT=30
MAX_RETRIES=5
RETRY_INTERVAL=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Basic health check
basic_health_check() {
    local url=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" || echo "000")
    
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Detailed health check
detailed_health_check() {
    local base_url=$1
    local checks=0
    local passed=0
    
    log "Running detailed health checks for: $base_url"
    
    # Check main page
    checks=$((checks + 1))
    if basic_health_check "$base_url"; then
        success "✓ Main page accessible"
        passed=$((passed + 1))
    else
        error "✗ Main page not accessible"
    fi
    
    # Check health endpoint
    checks=$((checks + 1))
    if basic_health_check "$base_url/health"; then
        success "✓ Health endpoint responding"
        passed=$((passed + 1))
    else
        warning "✗ Health endpoint not responding"
    fi
    
    # Check static assets
    checks=$((checks + 1))
    local asset_response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/assets/" 2>/dev/null || echo "404")
    if [ "$asset_response" = "200" ] || [ "$asset_response" = "403" ]; then
        success "✓ Static assets directory accessible"
        passed=$((passed + 1))
    else
        warning "✗ Static assets directory not found"
    fi
    
    # Check response time
    checks=$((checks + 1))
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --connect-timeout $TIMEOUT "$base_url" 2>/dev/null || echo "99")
    local response_time_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "9999")
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        success "✓ Response time acceptable (${response_time}s)"
        passed=$((passed + 1))
    else
        warning "✗ Response time slow (${response_time}s)"
    fi
    
    # Check security headers
    checks=$((checks + 1))
    local security_headers=$(curl -s -I "$base_url" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection" | wc -l)
    
    if [ "$security_headers" -ge 2 ]; then
        success "✓ Security headers present"
        passed=$((passed + 1))
    else
        warning "✗ Missing security headers"
    fi
    
    # Summary
    log "Health check summary: $passed/$checks checks passed"
    
    if [ "$passed" -eq "$checks" ]; then
        success "All health checks passed"
        return 0
    elif [ "$passed" -ge $((checks * 3 / 4)) ]; then
        warning "Most health checks passed"
        return 0
    else
        error "Health checks failed"
        return 1
    fi
}

# Wait for application to be ready
wait_for_ready() {
    local url=$1
    local retry=0
    
    log "Waiting for application to be ready at: $url"
    
    while [ $retry -lt $MAX_RETRIES ]; do
        log "Attempt $((retry + 1))/$MAX_RETRIES"
        
        if basic_health_check "$url"; then
            success "Application is ready!"
            return 0
        fi
        
        retry=$((retry + 1))
        if [ $retry -lt $MAX_RETRIES ]; then
            log "Waiting ${RETRY_INTERVAL}s before next attempt..."
            sleep $RETRY_INTERVAL
        fi
    done
    
    error "Application failed to become ready after $MAX_RETRIES attempts"
    return 1
}

# Performance test
performance_test() {
    local url=$1
    
    log "Running performance test..."
    
    # Test multiple concurrent requests
    local total_time=0
    local requests=5
    
    for i in $(seq 1 $requests); do
        local start_time=$(date +%s.%N)
        curl -s -o /dev/null "$url" &
        local pid=$!
        wait $pid
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc)
        total_time=$(echo "$total_time + $duration" | bc)
    done
    
    local avg_time=$(echo "scale=3; $total_time / $requests" | bc)
    log "Average response time over $requests requests: ${avg_time}s"
    
    if (( $(echo "$avg_time < 1.0" | bc -l) )); then
        success "Performance test passed"
    else
        warning "Performance test indicates slower response times"
    fi
}

# Main function
main() {
    log "Starting health check for: $URL"
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        error "curl is not installed"
    fi
    
    # Check if bc is available (for calculations)
    if ! command -v bc &> /dev/null; then
        warning "bc not available, skipping response time calculations"
    fi
    
    case "${2:-detailed}" in
        basic)
            if basic_health_check "$URL"; then
                success "Basic health check passed"
            else
                error "Basic health check failed"
            fi
            ;;
        wait)
            wait_for_ready "$URL"
            ;;
        performance)
            performance_test "$URL"
            ;;
        detailed|*)
            detailed_health_check "$URL"
            ;;
    esac
}

# Handle script execution
main "$@"