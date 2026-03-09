#!/bin/bash

# Deployment Verification Script for Railway SSL & CORS Fix
# Usage: ./verify-deployment.sh

set -e

DOMAIN="www.ailo.digital"
API_DOMAIN="www.ailo.digital"  # Adjust if API is on different domain

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Railway Deployment Verification - SSL & CORS Fix"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: HTTPS Redirect
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: HTTPS Redirect (HTTP → HTTPS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: http://$DOMAIN"
echo ""

REDIRECT=$(curl -s -I -L http://$DOMAIN | grep -i "^location:" | head -n 1)
if echo "$REDIRECT" | grep -q "https://$DOMAIN"; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP redirects to HTTPS"
    echo "   Redirect: $REDIRECT"
else
    echo -e "${RED}❌ FAIL${NC} - No HTTPS redirect found"
    echo "   Got: $REDIRECT"
fi
echo ""

# Test 2: SSL Certificate
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: SSL Certificate Validity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: https://$DOMAIN"
echo ""

SSL_INFO=$(curl -vI https://$DOMAIN 2>&1 | grep -i "subject:\|issuer:\|expire")
if echo "$SSL_INFO" | grep -q "subject:"; then
    echo -e "${GREEN}✅ PASS${NC} - Valid SSL certificate"
    echo "$SSL_INFO" | grep -i "subject:" | sed 's/^/   /'
    echo "$SSL_INFO" | grep -i "issuer:" | sed 's/^/   /'
else
    echo -e "${RED}❌ FAIL${NC} - SSL certificate error"
fi
echo ""

# Test 3: CORS Headers for www.ailo.digital
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: CORS Headers (www.ailo.digital)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: OPTIONS https://$API_DOMAIN/api/health"
echo "Origin: https://www.ailo.digital"
echo ""

CORS_RESPONSE=$(curl -s -I \
    -H "Origin: https://www.ailo.digital" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    https://$API_DOMAIN/api/health)

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin.*www.ailo.digital"; then
    echo -e "${GREEN}✅ PASS${NC} - CORS headers present for www.ailo.digital"
    echo "$CORS_RESPONSE" | grep -i "access-control" | sed 's/^/   /'
else
    echo -e "${RED}❌ FAIL${NC} - CORS headers missing or incorrect"
    echo "   Expected: Access-Control-Allow-Origin: https://www.ailo.digital"
    echo "   Got:"
    echo "$CORS_RESPONSE" | grep -i "access-control" | sed 's/^/   /'
fi
echo ""

# Test 4: CORS Headers for ailo.digital (no www)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: CORS Headers (ailo.digital - no www)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: OPTIONS https://ailo.digital/api/health"
echo "Origin: https://ailo.digital"
echo ""

CORS_RESPONSE_NOWWW=$(curl -s -I \
    -H "Origin: https://ailo.digital" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    https://ailo.digital/api/health)

if echo "$CORS_RESPONSE_NOWWW" | grep -qi "access-control-allow-origin.*ailo.digital"; then
    echo -e "${GREEN}✅ PASS${NC} - CORS headers present for ailo.digital"
    echo "$CORS_RESPONSE_NOWWW" | grep -i "access-control" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  WARN${NC} - CORS headers missing for ailo.digital (might need www subdomain)"
fi
echo ""

# Test 5: Security Headers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Security Headers (HSTS, X-Frame-Options, etc.)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: https://$DOMAIN"
echo ""

HEADERS=$(curl -s -I https://$DOMAIN)
echo "Checking for security headers:"

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    echo -e "${GREEN}✅ HSTS${NC}"
    echo "$HEADERS" | grep -i "strict-transport-security" | sed 's/^/   /'
else
    echo -e "${RED}❌ HSTS missing${NC}"
fi

if echo "$HEADERS" | grep -qi "x-frame-options"; then
    echo -e "${GREEN}✅ X-Frame-Options${NC}"
    echo "$HEADERS" | grep -i "x-frame-options" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  X-Frame-Options missing${NC}"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options${NC}"
    echo "$HEADERS" | grep -i "x-content-type-options" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  X-Content-Type-Options missing${NC}"
fi
echo ""

# Test 6: API Endpoint Availability
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: API Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: https://$API_DOMAIN/api/health"
echo ""

API_STATUS=$(curl -s -w "%{http_code}" -o /dev/null https://$API_DOMAIN/api/health)
if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - API health check returned 200 OK"
else
    echo -e "${RED}❌ FAIL${NC} - API health check returned $API_STATUS"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Test in browser: https://$DOMAIN"
echo "2. Check browser DevTools → Network for API calls"
echo "3. Refresh page (F5) - should NOT show offline page"
echo "4. Test offline mode: DevTools → Network → Offline → Refresh"
echo "   (Should show offline page ONLY when actually offline)"
echo ""
echo "If all tests pass:"
echo "  ✅ Deployment is successful"
echo "  ✅ SSL is working correctly"
echo "  ✅ CORS is configured for custom domain"
echo "  ✅ Users should see 🔒 Secure in browser"
echo ""
