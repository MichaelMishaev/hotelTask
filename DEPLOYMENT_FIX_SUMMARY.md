# Railway Deployment Fix - SSL & Offline Page Issue

**Date:** 2026-03-09
**Status:** ✅ **READY FOR DEPLOYMENT**

## Problem Summary

When accessing `www.ailo.digital` (custom domain on Railway):
1. ❌ Browser shows "Not Secure" warning
2. ❌ After page refresh, PWA shows "You're Offline" despite having internet

## Root Cause

1. **CORS Rejection** → Custom domain `www.ailo.digital` was NOT in backend CORS whitelist → API calls failed → Service worker served offline fallback
2. **No HTTPS Redirect** → Railway provides SSL at edge but doesn't auto-redirect HTTP to HTTPS → Users stayed on HTTP → Browser showed "Not Secure"

## Changes Made

### 1. Backend CORS Whitelist (`backend/src/Services/Booking/HotelBooking.Api/Program.cs`)

**Added custom domain to allowed origins:**
```csharp
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://hoteltask-production.up.railway.app",
        "https://frontend-production-4907.up.railway.app",
        // ✅ NEW: Custom domain (both with/without www, both HTTP/HTTPS)
        "https://www.ailo.digital",
        "https://ailo.digital",
        "http://www.ailo.digital",  // Temporary during transition
        "http://ailo.digital"
    };
```

**Effect:**
- Backend now accepts API calls from `www.ailo.digital` and `ailo.digital`
- Both HTTP and HTTPS origins allowed during transition
- Service worker will stop showing offline page (API calls will succeed)

### 2. Nginx HTTPS Redirect (`deploy/nginx.conf`)

**Added HTTPS redirect logic:**
```nginx
server {
    listen LISTEN_PORT;
    listen 8080;
    root /var/www/html;
    index index.html;

    # ✅ NEW: HTTPS redirect (Railway provides SSL termination at edge)
    # X-Forwarded-Proto is set by Railway's load balancer
    if ($http_x_forwarded_proto = "http") {
        return 301 https://$host$request_uri;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    # ... rest of config
}
```

**Effect:**
- All HTTP traffic auto-redirects to HTTPS
- Browser will show 🔒 Secure (no "Not Secure" warning)
- Works with Railway's SSL termination architecture

## Deployment Instructions

### Option 1: Railway CLI (Recommended)

```bash
# 1. Check current status
railway status

# 2. Deploy (triggers rebuild)
railway up

# 3. Monitor logs
railway logs --follow

# 4. Watch for successful deployment
railway status
```

### Option 2: Git Push (If Railway auto-deploys on push)

```bash
# 1. Commit changes
git add backend/src/Services/Booking/HotelBooking.Api/Program.cs deploy/nginx.conf
git commit -m "fix: add custom domain to CORS whitelist and enable HTTPS redirect

- Add www.ailo.digital and ailo.digital to CORS allowed origins
- Add HTTPS redirect in nginx using X-Forwarded-Proto
- Fixes 'Not Secure' warning and offline page issue on custom domain"

# 2. Push to main (or production branch)
git push origin main

# 3. Check Railway dashboard for deployment status
```

## Verification Steps

### Step 1: Test CORS (After Backend Deploys)

```bash
# Test HTTPS origin
curl -H "Origin: https://www.ailo.digital" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://www.ailo.digital/api/health

# Expected: Should see CORS headers
# Access-Control-Allow-Origin: https://www.ailo.digital
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
```

### Step 2: Test HTTPS Redirect (After Nginx Deploys)

```bash
# Test HTTP redirect
curl -I http://www.ailo.digital

# Expected: 301 redirect
# Location: https://www.ailo.digital/
```

### Step 3: Browser Testing

1. Navigate to `http://www.ailo.digital`
2. ✅ Verify auto-redirect to `https://www.ailo.digital`
3. ✅ Check browser shows 🔒 Secure (no "Not Secure" warning)
4. Open DevTools → Network tab
5. ✅ Verify API calls to `/api/*` succeed (200 OK, no CORS errors)
6. Refresh page (F5)
7. ✅ Verify app loads normally (NOT offline page)
8. Check DevTools → Application → Service Workers
9. ✅ Should show "activated and running"

### Step 4: Offline Page Test (Should Still Work)

1. With app loaded at `https://www.ailo.digital`
2. Open DevTools → Network → Throttling → Offline
3. Refresh page
4. ✅ **Now** should see "You're Offline" page (correct behavior)
5. Re-enable network
6. Click "Try Again"
7. ✅ App should load

## Expected Outcomes

After deployment:
- ✅ Browser shows 🔒 Secure at `www.ailo.digital`
- ✅ All HTTP requests auto-redirect to HTTPS
- ✅ API calls from custom domain succeed (no CORS errors)
- ✅ Page refresh loads app normally (no offline page)
- ✅ Offline page ONLY shows when network is actually offline
- ✅ HSTS header enforces HTTPS for 2 years
- ✅ PWA functions normally (caching, offline fallback work correctly)

## Rollback Plan

If issues occur after deployment:

### Using Railway CLI
```bash
# View recent deployments
railway deployments

# Rollback to previous deployment
railway rollback <deployment-id>
```

### Using Git
```bash
# Revert this commit
git revert HEAD

# Push revert
git push origin main
```

## Notes

- **Railway SSL**: SSL is provisioned automatically by Railway for custom domains
- **DNS Propagation**: If SSL isn't working, check DNS settings (CNAME `www.ailo.digital` → Railway target)
- **Service Worker Cache**: Users might need hard refresh (Ctrl+Shift+R) to clear old cached responses
- **HSTS**: Already configured in `SecurityHeadersMiddleware.cs` with `max-age=63072000` (2 years)

## Future Cleanup (After HTTPS is Verified Working)

Once HTTPS redirect is confirmed working, remove HTTP origins from CORS whitelist:

```csharp
// Remove these lines after HTTPS redirect is verified:
// "http://www.ailo.digital",
// "http://ailo.digital"
```

This improves security by only accepting HTTPS origins in production.

## Security Headers Already in Place

From `backend/src/Services/Booking/HotelBooking.Api/Middleware/SecurityHeadersMiddleware.cs`:

- ✅ HSTS: `max-age=63072000; includeSubDomains`
- ✅ X-Frame-Options: `DENY`
- ✅ X-Content-Type-Options: `nosniff`
- ✅ X-XSS-Protection: `1; mode=block`
- ✅ Referrer-Policy: `strict-origin-when-cross-origin`

All active in production environment.
