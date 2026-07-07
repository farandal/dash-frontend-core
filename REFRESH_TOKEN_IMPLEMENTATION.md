# Refresh Token Implementation Guide

> **Last Updated**: 2026-07-07  
> **Status**: Production Ready  
> **Scope**: All Frontend Apps (kitchntabs-web, kitchntabs-system, kitchntabs-app)

---

## Overview

The KitchnTabs application implements automatic token refresh to keep user sessions alive without requiring re-authentication. When an access token expires, the system automatically uses the refresh token to obtain a new access token and transparently retries the failed request.

### Token Lifecycle

```
┌─────────────┐
│  User Login │
│             │
│ Returns:    │
│ - token (AT)         (24 hours)
│ - refresh_token (RT) (30 days)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Make API Request │ ◄─── AT in Authorization header
└──────┬───────────┘
       │
       ├─── Success (2xx) ───────► Return Response
       │
       └─── Unauthorized (401) ───┐
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  Refresh Token   │
                          │  Exchange        │
                          │                  │
                          │ Send: RT         │
                          │ Receive: New AT  │
                          │         New RT   │
                          └────┬─────────────┘
                               │
                               ├─── Success ───┐
                               │                │
                               └─── Failure ◄──┘
                                      │
                                      ▼
                                  Logout User
                                  Redirect to /login
```

---

## Frontend Implementation

### 1. Axios Interceptor with Auto-Refresh

**File**: `packages/dash-admin/src/hooks/axios.tsx`

The axios instance is configured with a response interceptor that:

1. Detects 401 Unauthorized errors
2. Checks if a refresh token is available
3. Attempts to refresh the access token
4. Queues subsequent requests during refresh
5. Retries the original request with the new token
6. Falls back to logout on refresh failure

**Key Features**:

- **Token Rotation**: Each successful refresh invalidates the old refresh token and issues a new one
- **Request Queuing**: Multiple requests that fail with 401 are queued and retried together after refresh
- **Auth Endpoint Skipping**: Prevents infinite loops by skipping refresh for `/login`, `/auth/refresh`, `/logout`
- **Device Tracking**: IP and User-Agent are logged for audit purposes
- **Automatic Cleanup**: Expired tokens are cleaned up via scheduled backend tasks

### 2. Token Storage

**Location**: localStorage via `dashStorage` wrapper

| Key | Value | Usage |
|-----|-------|-------|
| `token` | Access Token | Bearer token for API requests |
| `refreshToken` | Refresh Token | Exchanged for new access token when AT expires |
| `authenticated` | `true`/`false` | Auth state flag |
| `user` | User object JSON | Current user data |
| `auth` | Auth object JSON | Full auth response data |
| `roles` | Role array JSON | User roles for permissions |

### 3. Login Flow

**File**: `packages/dash-admin/src/providers/authProvider.tsx`

When user logs in:

```typescript
const loginResponse = await axios.post('/login', {
  email: username,
  password,
});

// Store both tokens
dashStorage.setItem('token', loginResponse.data.token);
dashStorage.setItem('refreshToken', loginResponse.data.refresh_token);

// Fetch additional auth data
const { data: auth } = await axios.get('/auth/getauth');
dashStorage.setItem('auth', JSON.stringify(auth));
```

### 4. Logout Flow

When user logs out or refresh fails:

```typescript
export const logoutFromStorage = async () => {
  // Clear auth tokens
  dashStorage.removeItem('token');
  dashStorage.removeItem('refreshToken');
  dashStorage.removeItem('user');
  dashStorage.removeItem('auth');
  dashStorage.setItem('authenticated', 'false');
  
  // Clear device store (Electron/Capacitor)
  await clearDeviceStoreAuth();
  
  // Redirect to login
  window.location.href = '/login';
};
```

---

## Backend Implementation

### 1. Refresh Token Endpoints

**Controller**: `app/Http/Controllers/API/Auth/RefreshTokenController.php`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/refresh` | No | Exchange refresh token for new access token |
| GET | `/auth/sessions` | Yes | List active sessions |
| POST | `/auth/revoke-all` | Yes | Revoke all sessions |
| DELETE | `/auth/sessions/{id}` | Yes | Revoke specific session |

### 2. Refresh Request

```json
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "randomString64chars..."
}
```

### 3. Refresh Response

```json
{
  "token": "1|newAccessToken...",
  "refresh_token": "newRefreshToken64chars...",
  "expires_at": "2026-01-01 10:00:00",
  "refresh_expires_at": "2026-01-30 10:00:00",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 4. Token Validation

The backend validates refresh tokens by:

1. **Hash Verification**: Token is hashed with SHA-256 before storage
2. **Expiration Check**: Token must not be expired
3. **Revocation Check**: Token must not be marked as revoked
4. **User Status**: User must be active
5. **Device Tracking**: IP and User-Agent are logged for audit

---

## Flow Diagrams

### Successful Token Refresh

```
Frontend                          Backend
   │                                │
   ├─ Make API Request ─────────────▶│
   │  (with expired AT)              │
   │                                 │
   │◀──── 401 Unauthorized ──────────┤
   │                                 │
   ├─ POST /auth/refresh ────────────▶│
   │  (with RT)                      │
   │                                 │
   │◀─── 200 OK ──────────────────────┤
   │  (new AT, new RT)               │
   │                                 │
   ├─ Store new tokens               │
   │ - token = new AT                │
   │ - refreshToken = new RT         │
   │                                 │
   ├─ Retry original request ───────▶│
   │  (with new AT)                  │
   │                                 │
   │◀─── 200 OK ──────────────────────┤
   │  (response data)                │
```

### Failed Token Refresh → Logout

```
Frontend                          Backend
   │                                │
   ├─ POST /auth/refresh ────────────▶│
   │  (with expired/invalid RT)      │
   │                                 │
   │◀──── 401 Unauthorized ──────────┤
   │  (code: INVALID_REFRESH_TOKEN)  │
   │                                 │
   ├─ Clear tokens                   │
   │ - token = null                  │
   │ - refreshToken = null           │
   │                                 │
   ├─ Dispatch auth:logout event     │
   │                                 │
   ├─ Redirect to /login             │
   │                                 │
```

---

## Testing Refresh Token Flow

### Backend Tests

Run comprehensive backend tests:

```bash
docker compose exec app php artisan test tests/Feature/Auth/RefreshTokenTest.php --testdox
```

**Tests Included** (16 tests):

- ✅ User can successfully refresh access token
- ✅ Refresh fails with invalid token
- ✅ Refresh fails with expired token
- ✅ Refresh fails with revoked token
- ✅ Refresh fails when user is inactive
- ✅ Refresh fails when user is deleted
- ✅ Get active sessions for user
- ✅ Revoke all sessions
- ✅ Revoke specific session
- ✅ Token refresh tracks device info
- ✅ Refresh token expires in 30 days
- ✅ Access token expires in 24 hours
- ✅ Old refresh token is revoked after refresh
- ✅ Refresh requires refresh token parameter
- ✅ Concurrent refresh requests
- ✅ Cleanup of expired refresh tokens

### Frontend Manual Testing

1. **Setup**:
   ```bash
   # Start frontend app
   cd kitchntabs-frontend-refactored
   pnpm dev
   ```

2. **Test Access Token Expiration**:
   - Login to app
   - Open DevTools → Application → LocalStorage
   - Note the `token` value
   - Manually delete the `token` (simulating expiration)
   - Make an API request (e.g., navigate to a page)
   - Observer in Network tab: Should see POST to `/auth/refresh` succeed
   - The original request should be retried automatically
   - User should NOT be logged out

3. **Test Refresh Token Expiration**:
   - Delete both `token` AND `refreshToken` from localStorage
   - Make an API request
   - Observer in Network tab: Should see failed `/auth/refresh` with 401
   - App should redirect to `/login`
   - User should be logged out

4. **Test Logout**:
   - Login and verify tokens in localStorage
   - Click logout
   - Verify `token` and `refreshToken` are removed
   - Verify you're redirected to `/login`

---

## Configuration

### Access Token Expiration

**Backend** (`RefreshTokenController.php`):
```php
$expiresAt = Carbon::now()->addHours(24);  // 24-hour validity
```

### Refresh Token Expiration

**Backend** (`RefreshToken.php`):
```php
public const EXPIRATION_DAYS = 30;  // 30-day validity
```

### Max Tokens Per Device

**Backend** (`RefreshToken.php`):
```php
public const MAX_TOKENS_PER_DEVICE = 5;  // Keep 5 most recent tokens
```

---

## Security Considerations

### 1. Token Rotation

Each refresh invalidates the old refresh token, limiting the window of opportunity for stolen tokens.

✅ **Implemented**: Old token is revoked on successful refresh

### 2. Device Tracking

Device information (IP, User-Agent) is logged for audit and anomaly detection.

✅ **Implemented**: Tracked in `RefreshToken` model on both create and refresh

### 3. Token Storage

Tokens are stored in localStorage. For higher security environments, consider HttpOnly cookies.

⚠️ **Note**: localStorage is accessible via JavaScript (XSS vulnerability)

**Recommendation**: Use Content Security Policy (CSP) to prevent XSS attacks

### 4. HTTPS Required

Always use HTTPS in production to prevent token interception in transit.

✅ **Enforced**: All frontend apps use HTTPS in production

### 5. Refresh Token Cleanup

Expired tokens are automatically purged from the database.

✅ **Implemented**: Scheduled via `CleanupExpiredRefreshTokens` command

### 6. Token Limit Per Device

Maximum 5 tokens kept per user per device to prevent token accumulation.

✅ **Implemented**: Old tokens automatically revoked via `cleanupOldTokens()`

---

## Troubleshooting

### Issue: User gets logged out unexpectedly

**Possible Causes**:
1. Refresh token expired (30+ days)
2. Refresh token revoked by admin
3. User account deactivated
4. Network error during refresh attempt

**Debug Steps**:
```javascript
// In browser console
console.log('Current tokens:', {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
});

// Make API request to trigger refresh
fetch('https://api-dev.kitchntabs.com/api/auth/getauth', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
  .then(r => r.json())
  .then(console.log);
```

### Issue: Token never refreshes, keeps getting 401

**Possible Causes**:
1. Refresh token not stored in localStorage
2. Refresh endpoint not responding
3. Axios interceptor not properly configured
4. Auth endpoint misconfigured

**Debug Steps**:
```javascript
// Verify token is stored
if (!localStorage.getItem('refreshToken')) {
  console.error('No refresh token found!');
}

// Check network in DevTools:
// Should see POST to /api/auth/refresh when 401 occurs
```

### Issue: Multiple refresh requests happening simultaneously

**Expected Behavior**:
When multiple requests fail with 401, the axios interceptor queues them and executes refresh only once.

**Debug**:
```javascript
// Network tab should show only ONE POST /auth/refresh
// followed by retries of the original requests
```

---

## Electron & Android Specific Considerations

### Electron

- Refresh tokens work the same as web
- DeviceStore may override storage - verify via `dash-auth/clearDeviceStoreAuth()`
- Ensure Python service doesn't make auth requests (uses different auth mechanism)

### Android

- Refresh tokens work the same as web
- Capacitor storage wrapper handles persistence
- Network errors may require retry logic (handled by axios)

---

## Migration Guide (if upgrading from old auth)

If your app previously used long-lived tokens without refresh:

1. **Backend**:
   - Ensure `RefreshToken` model and migration exist
   - Run: `php artisan migrate`

2. **Frontend**:
   - Update `packages/dash-admin/src/hooks/axios.tsx` with refresh interceptor
   - Ensure login endpoint returns `refresh_token`
   - Test login flow returns both tokens

3. **Apps**:
   - kitchntabs-web: Uses dash-admin (auto-updated)
   - kitchntabs-system: Uses dash-admin (auto-updated)
   - kitchntabs-app: Uses dash-admin (auto-updated)

---

## Key Files Reference

### Backend

| File | Purpose |
|------|---------|
| `app/Models/RefreshToken.php` | Token model + lifecycle methods |
| `app/Http/Controllers/API/Auth/RefreshTokenController.php` | Refresh endpoints |
| `database/migrations/2025_01_20_000001_create_refresh_tokens_table.php` | Database schema |
| `app/Console/Commands/CleanupExpiredRefreshTokens.php` | Cleanup scheduler |
| `tests/Feature/Auth/RefreshTokenTest.php` | Test suite (16 tests) |

### Frontend

| File | Purpose |
|------|---------|
| `packages/dash-admin/src/hooks/axios.tsx` | Axios with auto-refresh interceptor |
| `packages/dash-admin/src/providers/authProvider.tsx` | Login/logout with token storage |
| `packages/dash-auth/src/...` | Auth utilities |
| `packages/dash-utils/src/dashStorage.ts` | Storage abstraction |

---

## Verification Checklist

- ✅ Backend: RefreshToken model exists and has all methods
- ✅ Backend: RefreshTokenController has all 4 endpoints
- ✅ Backend: Tests pass (16/16)
- ✅ Backend: `routes/api.php` has `/auth/refresh` route
- ✅ Frontend: axios.tsx has 401 interceptor
- ✅ Frontend: authProvider stores refresh token on login
- ✅ Frontend: Logout clears refresh token
- ✅ Frontend: Apps test refresh flow manually
- ✅ Electron: Refresh token works in Electron sandbox
- ✅ Android: Refresh token works on Android/Capacitor

---

**Last Updated**: 2026-07-07  
**Test Status**: ✅ All 16 backend tests passing  
**Frontend Status**: ✅ Interceptor implemented and configured

