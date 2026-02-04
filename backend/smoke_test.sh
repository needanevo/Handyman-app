#!/bin/bash
# Smoke test for JobStatus and lifecycle endpoints on the server
# Uses curl to test actual API endpoints

set -e

API_BASE="https://api.therealjohnson.services"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}SMOKE TEST: JobStatus and Lifecycle Endpoints${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "API Base: $API_BASE"
echo ""

# Helper function to make requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Authorization: Bearer $token"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$API_BASE$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$API_BASE$endpoint"
        fi
    fi
}

echo -e "${YELLOW}1. CUSTOMER: Create Quote → Verify Job Created${NC}"
echo -e "${YELLOW}   POST /quotes${NC}"
echo ""

# TODO: Replace with actual customer token
CUSTOMER_TOKEN="YOUR_CUSTOMER_TOKEN_HERE"

# Create a quote
QUOTE_RESPONSE=$(make_request "POST" "/quotes" '{"service_category": "General Handyman", "description": "Smoke test quote", "address": {"street": "123 Test", "city": "Test", "state": "TS", "zip": "12345"}}' "$CUSTOMER_TOKEN")
echo "Response: $QUOTE_RESPONSE"
QUOTE_ID=$(echo $QUOTE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Quote ID: $QUOTE_ID"
echo ""

# Check if job was created
echo -e "${YELLOW}2. CUSTOMER: GET /jobs/{job_id}${NC}"
echo ""
JOB_RESPONSE=$(make_request "GET" "/jobs/$JOB_ID" "" "$CUSTOMER_TOKEN")
echo "Response: $JOB_RESPONSE"
echo ""

echo -e "${YELLOW}3. CONTRACTOR: GET /contractor/jobs/available${NC}"
echo ""
CONTRACTOR_TOKEN="YOUR_CONTRACTOR_TOKEN_HERE"
FEED_RESPONSE=$(make_request "GET" "/contractor/jobs/available" "" "$CONTRACTOR_TOKEN")
echo "Response: $FEED_RESPONSE"
echo ""

echo -e "${YELLOW}4. CONTRACTOR: POST /contractor/jobs/{job_id}/accept${NC}"
echo ""
ACCEPT_RESPONSE=$(make_request "POST" "/contractor/jobs/$JOB_ID/accept" "{}" "$CONTRACTOR_TOKEN")
echo "Response: $ACCEPT_RESPONSE"
echo ""

echo -e "${YELLOW}5. CONTRACTOR: PATCH /contractor/jobs/{job_id}/status${NC}"
echo "   Transition: accepted → in_progress"
echo ""
STATUS_RESPONSE=$(make_request "PATCH" "/contractor/jobs/$JOB_ID/status" '{"status": "in_progress"}' "$CONTRACTOR_TOKEN")
echo "Response: $STATUS_RESPONSE"
echo ""

echo -e "${YELLOW}6. CONTRACTOR: POST /jobs/{job_id}/cancel (should reject)${NC}"
echo ""
CANCEL_RESPONSE=$(make_request "POST" "/jobs/$JOB_ID/cancel" '{"reason": "Testing cancellation"}' "$CUSTOMER_TOKEN")
echo "Response: $CANCEL_RESPONSE"
echo ""

echo -e "${YELLOW}7. HANDYMAN: POST /handyman/jobs/{job_id}/accept (alias)${NC}"
echo ""
HANDYMAN_TOKEN="YOUR_HANDYMAN_TOKEN_HERE"
HANDYMAN_ACCEPT_RESPONSE=$(make_request "POST" "/handyman/jobs/$JOB_ID/accept" "{}" "$HANDYMAN_TOKEN")
echo "Response: $HANDYMAN_ACCEPT_RESPONSE"
echo ""

echo -e "${YELLOW}8. ADMIN: GET /jobs/{job_id} (unrestricted)${NC}"
echo ""
ADMIN_TOKEN="YOUR_ADMIN_TOKEN_HERE"
ADMIN_RESPONSE=$(make_request "GET" "/jobs/$JOB_ID" "" "$ADMIN_TOKEN")
echo "Response: $ADMIN_RESPONSE"
echo ""

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}SMOKE TEST COMPLETE${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "To run this test with real tokens:"
echo "1. Replace CUSTOMER_TOKEN, CONTRACTOR_TOKEN, HANDYMAN_TOKEN, ADMIN_TOKEN"
echo "2. Update JOB_ID if creating a specific job"
echo ""
