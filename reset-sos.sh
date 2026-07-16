#!/bin/bash

# SOS Workflow Reset Script
# Quick development reset for testing

# Configuration
API_URL="http://localhost:5000/api"
EMAIL="${1:-patient@test.com}"
PASSWORD="${2:-password123}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SOS Workflow Reset (Development Only)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Check current state
echo -e "${YELLOW}🔍 Checking current system state...${NC}"
STATE_RESPONSE=$(curl -s "$API_URL/dev/state")

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to connect to API at $API_URL${NC}"
  echo "   Make sure the backend server is running."
  exit 1
fi

echo "$STATE_RESPONSE" | jq '.data.state' 2>/dev/null || echo "$STATE_RESPONSE"
echo ""

# Step 2: Login to get token
echo -e "${YELLOW}🔑 Logging in as $EMAIL...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Check credentials.${NC}"
  echo "   Email: $EMAIL"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# Step 3: Reset SOS workflow
echo -e "${YELLOW}🧹 Resetting SOS workflow...${NC}"
RESET_RESPONSE=$(curl -s -X POST "$API_URL/dev/reset-sos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$RESET_RESPONSE" | jq '.' 2>/dev/null || echo "$RESET_RESPONSE"
echo ""

# Step 4: Verify reset
echo -e "${GREEN}✅ Reset complete!${NC}"
echo ""
echo -e "${YELLOW}🔍 Verifying system state after reset...${NC}"
VERIFY_RESPONSE=$(curl -s "$API_URL/dev/state")
echo "$VERIFY_RESPONSE" | jq '.data.state' 2>/dev/null || echo "$VERIFY_RESPONSE"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  System is ready for fresh SOS testing!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
