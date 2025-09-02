#!/bin/bash

echo "========================================="
echo "Testing Golden Hour Application"
echo "========================================="

BASE_URL="http://localhost:3002"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Status: $http_code${NC}"
        echo "Response preview: $(echo "$body" | head -c 200)..."
    else
        echo -e "${RED}✗ Status: $http_code${NC}"
        echo "Response: $body"
    fi
}

# Test main page
echo -e "\n${YELLOW}=== Testing Main Page ===${NC}"
page_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$page_response" = "200" ]; then
    echo -e "${GREEN}✓ Main page loads successfully${NC}"
else
    echo -e "${RED}✗ Main page failed: $page_response${NC}"
fi

# Test API endpoints
echo -e "\n${YELLOW}=== Testing API Endpoints ===${NC}"

test_endpoint "/api/location" "Location Detection API"
test_endpoint "/api/weather?lat=40.7128&lon=-74.006" "Weather API (New York)"
test_endpoint "/api/golden-hour?lat=40.7128&lon=-74.006&date=2025-09-01" "Golden Hour Calculation API"
test_endpoint "/api/places/search?query=Paris" "Places Search API"
test_endpoint "/api/places/nearby?lat=40.7128&lon=-74.006" "Nearby Places API"

# Test static resources
echo -e "\n${YELLOW}=== Testing Static Resources ===${NC}"

resources=(
    "/favicon.ico"
    "/manifest.json"
    "/service-worker.js"
    "/_next/static/css/app/layout.css"
)

for resource in "${resources[@]}"; do
    if [[ "$resource" == *".css"* ]]; then
        # For CSS files, we need to get the actual versioned URL
        actual_url=$(curl -s "$BASE_URL" | grep -o "/_next/static/css/[^\"]*" | head -1)
        if [ ! -z "$actual_url" ]; then
            resource=$actual_url
        fi
    fi
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${resource}")
    if [ "$status" = "200" ] || [ "$status" = "304" ]; then
        echo -e "${GREEN}✓ $resource - Status: $status${NC}"
    else
        echo -e "${RED}✗ $resource - Status: $status${NC}"
    fi
done

# Check for JavaScript functionality
echo -e "\n${YELLOW}=== Checking JavaScript Functionality ===${NC}"

# Check if React is loaded
html_content=$(curl -s "$BASE_URL")
if echo "$html_content" | grep -q "/_next/static/chunks/main-app.js"; then
    echo -e "${GREEN}✓ React/Next.js scripts are loading${NC}"
else
    echo -e "${RED}✗ React/Next.js scripts not found${NC}"
fi

# Check for hydration markers
if echo "$html_content" | grep -q "<!--\$"; then
    echo -e "${GREEN}✓ Server-side rendering markers found${NC}"
else
    echo -e "${RED}✗ No SSR markers found${NC}"
fi

# Test interactive features via API
echo -e "\n${YELLOW}=== Testing Interactive Features ===${NC}"

# Test location-based features
echo "Testing location auto-detection..."
location_response=$(curl -s "$BASE_URL/api/location")
if echo "$location_response" | grep -q "city"; then
    echo -e "${GREEN}✓ Location auto-detection working${NC}"
else
    echo -e "${RED}✗ Location auto-detection failed${NC}"
fi

# Test date-based calculations
today=$(date +%Y-%m-%d)
echo "Testing golden hour calculation for today..."
gh_response=$(curl -s "$BASE_URL/api/golden-hour?lat=40.7128&lon=-74.006&date=$today")
if echo "$gh_response" | grep -q "sunrise"; then
    echo -e "${GREEN}✓ Golden hour calculations working${NC}"
else
    echo -e "${RED}✗ Golden hour calculations failed${NC}"
fi

echo -e "\n${YELLOW}=== Summary ===${NC}"
echo "Test completed. Check above for any failures marked with ✗"