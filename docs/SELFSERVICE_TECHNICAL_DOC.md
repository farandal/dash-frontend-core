# Self-Service Kiosk - Technical Documentation

> Complete technical documentation for the Self-Service Kiosk feature, including architecture, flows, and component details.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Flow](#system-flow)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Security Considerations](#security-considerations)

---

## Architecture Overview

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Customer Device"]
        QR[QR Scanner]
        Browser[Mobile Browser]
    end
    
    subgraph Frontend["Frontend Application"]
        Wrapper[SelfServiceClientWrapper]
        AuthProvider[SelfServiceClientAuthProvider]
        DataProvider[SelfServiceClientDataProvider]
        Bootstrap[KitchnTabsBootstrap]
    end
    
    subgraph Backend["Backend API"]
        SessionController[SelfServiceSessionController]
        TabsController[SelfServiceTabsController]
        Routes[selfservice.php Routes]
    end
    
    subgraph Database["Database"]
        Sessions[(self_service_sessions)]
        Tabs[(tabs)]
        Orders[(orders)]
        Products[(products)]
    end
    
    QR --> Browser
    Browser --> Bootstrap
    Bootstrap --> Wrapper
    Wrapper --> AuthProvider
    Wrapper --> DataProvider
    DataProvider --> Routes
    Routes --> SessionController
    Routes --> TabsController
    SessionController --> Sessions
    TabsController --> Tabs
    TabsController --> Orders
end
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Guest Authentication** | Customers don't need accounts; sessions act as temporary identities |
| **Session-Based Access** | 5-character hash provides security without login complexity |
| **10-Hour Expiration** | Balances convenience with security |
| **Tenant-Scoped** | Each session is bound to a single tenant's products |
| **No Master/Slave Tabs** | Simplified from mall architecture (single tenant = simple tabs) |

---

## System Flow

### Session Creation & Activation Flow

```mermaid
sequenceDiagram
    participant Admin as Restaurant Admin
    participant API as Backend API
    participant DB as Database
    participant Customer as Customer Device
    
    Admin->>API: POST /client_session/{tenantSlug}
    API->>DB: Create session (status: pending)
    API-->>Admin: Return hash (e.g., DFJNL)
    Admin->>Admin: Generate QR with URL
    
    Customer->>Customer: Scan QR Code
    Customer->>API: GET /{hash}/getSessionAuth
    API->>DB: Find session by hash
    
    alt Session is Pending
        API->>DB: Update status to 'active'
        API->>DB: Store client IP & user agent
        API-->>Customer: Return tenant data + session info
    else Session is Active
        API->>API: Validate client identity
        alt Identity matches
            API-->>Customer: Return tenant data
        else Identity mismatch
            API-->>Customer: 403 Forbidden
        end
    else Session Expired
        API-->>Customer: 410 Gone
    end
```

### Order Submission Flow

```mermaid
sequenceDiagram
    participant Customer as Customer Device
    participant FE as Frontend
    participant API as Backend API
    participant Kitchen as Kitchen Display
    
    Customer->>FE: Add products to cart
    Customer->>FE: Click "Submit Order"
    FE->>API: POST /public/selfservice/tab
    
    Note over API: Validates session<br/>Creates tab + order<br/>Associates with tenant
    
    API->>API: Create Tab (status: created)
    API->>API: Create Order with items
    API-->>FE: Return tab ID
    FE-->>Customer: Show confirmation
    
    API->>Kitchen: WebSocket notification
    Kitchen->>Kitchen: Display new order
    Kitchen->>API: Confirm order
    API->>FE: Push status update
    FE-->>Customer: "Order Confirmed!"
```

---

## Backend Components

### Models

#### SelfServiceSession

| Field | Type | Description |
|-------|------|-------------|
| `id` | bigint | Primary key |
| `hash` | string(10) | Unique 5-char identifier |
| `tenant_id` | uuid | Foreign key to tenants |
| `customer_name` | string | Optional customer name |
| `table_number` | string | Table/location identifier |
| `status` | enum | pending, active, completed, cancelled |
| `meta` | json | Client IP, user agent, timestamps |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update |
| `deleted_at` | timestamp | Soft delete |

**File:** [SelfServiceSession.php](file:///Users/farandal/DASH-PW-PROJECT/dash-backend/domain/app/Models/SelfService/SelfServiceSession.php)

### Controllers

#### SelfServiceSessionController

Handles session lifecycle management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `createSession` | POST /session/create | Create new session |
| `getSession` | GET /session/{hash} | Get session details |
| `updateSession` | PUT /session/{hash} | Update session |
| `completeSession` | POST /session/{hash}/complete | Mark as completed |
| `cancelSession` | POST /session/{hash}/cancel | Cancel session |
| `getSessionAuth` | GET /{hash}/getSessionAuth | Validate & authenticate session |
| `createClientSession` | POST /client_session/{tenantSlug} | Create session by tenant slug |

**File:** [SelfServiceSessionController.php](file:///Users/farandal/DASH-PW-PROJECT/dash-backend/domain/app/Http/Controllers/API/SelfService/SelfServiceSessionController.php)

#### SelfServiceTabsController

Handles tab/order operations, extends base TabController.

| Method | Description |
|--------|-------------|
| `_preList` | Filter tabs by selfservice_session |
| `_preGetOne` | Load order items with products |
| `downloadSaleNote` | Generate PDF receipt |

**File:** [SelfServiceTabsController.php](file:///Users/farandal/DASH-PW-PROJECT/dash-backend/domain/app/Http/Controllers/API/SelfService/SelfServiceTabsController.php)

### Routes

**File:** [selfservice.php](file:///Users/farandal/DASH-PW-PROJECT/dash-backend/domain/routes/api/selfservice.php)

```php
// Public routes (no auth required)
Route::prefix('public/selfservice')->group(function () {
    // Session management
    Route::post('/session/create', 'createSession');
    Route::get('/session/{hash}', 'getSession');
    Route::put('/session/{hash}', 'updateSession');
    Route::post('/session/{hash}/complete', 'completeSession');
    Route::post('/session/{hash}/cancel', 'cancelSession');
    
    // Session auth (validates and activates)
    Route::get('/{sessionId}/getSessionAuth', 'getSessionAuth');
    
    // Client session creation by slug
    Route::post('/client_session/{tenantSlug}', 'createClientSession');
    
    // Tab CRUD (React Admin methods)
    Route::resource('tab', SelfServiceTabsController::class);
});
```

### Traits

#### SelfServiceAuthResponseTrait

Builds the authentication response with tenant data.

**File:** [SelfServiceAuthResponseTrait.php](file:///Users/farandal/DASH-PW-PROJECT/dash-backend/domain/app/Http/Controllers/API/SelfService/Traits/SelfServiceAuthResponseTrait.php)

---

## Frontend Components

### Component Hierarchy

```mermaid
flowchart TD
    A[KitchnTabsBootstrap] --> B{URL Pattern?}
    B -->|/selfservice/*| C[SelfServiceClientWrapper]
    B -->|Other| D[Normal App]
    
    C --> E[Session Validation]
    E -->|Valid| F[KitchnTabsPrivateApp]
    E -->|Invalid| G[Error Screen]
    
    F --> H[SelfServiceClientAuthProvider]
    F --> I[SelfServiceClientDataProvider]
    
    H --> J[Guest Identity]
    I --> K[API Calls with session]
```

### SelfServiceClientWrapper

**Purpose:** Validates session before rendering the app.

**File:** [SelfServiceClientWrapper.tsx](file:///Users/farandal/DASH-PW-PROJECT/dash-frontend/apps/kitchntabs/src/components/selfservice/SelfServiceClientWrapper.tsx)

**Key Functions:**
- Parses URL for tenant slug and session hash
- Calls `/getSessionAuth` to validate session
- Stores session data in localStorage
- Sets guest as "authenticated" for React Admin
- Renders error states for invalid sessions

### SelfServiceClientAuthProvider

**Purpose:** Provides guest authentication for React Admin.

**File:** [DASHSelfServiceClientAuthProvider.tsx](file:///Users/farandal/DASH-PW-PROJECT/dash-frontend/apps/kitchntabs/src/dash-extensions/config/DASHSelfServiceClientAuthProvider.tsx)

**Key Functions:**
- `getIdentity()`: Returns guest identity
- `checkAuth()`: Always resolves (guest is "authenticated")
- `getPermissions()`: Returns `['guest', 'public']`

### SelfServiceClientDataProvider

**Purpose:** Maps resources to self-service API endpoints.

**File:** [DASHSelfServiceClientDataProvider.tsx](file:///Users/farandal/DASH-PW-PROJECT/dash-frontend/apps/kitchntabs/src/dash-extensions/config/DASHSelfServiceClientDataProvider.tsx)

**Resource Mapping:**
```typescript
{
  'tab': 'public/selfservice/tab'
}
```

**Key Functions:**
- Injects `selfservice_session` into all requests
- Maps resource names to API paths
- Disables delete operations

### KitchnTabsBootstrap (Modified)

**File:** [KitchnTabsBootstrap.tsx](file:///Users/farandal/DASH-PW-PROJECT/dash-frontend/apps/kitchntabs/src/KitchnTabsBootstrap.tsx)

**Changes:**
- Detects `/selfservice/:tenantSlug/s/:sessionId` URL pattern
- Renders `SelfServiceClientWrapper` for self-service URLs
- Passes self-service providers to private app

---

## API Reference

### Session Endpoints

#### Create Client Session

```http
POST /api/public/selfservice/client_session/{tenantSlug}
Content-Type: application/json

{
  "table_number": "12",
  "meta": {}
}
```

**Response (201):**
```json
{
  "data": {
    "hash": "DFJNL",
    "tenant_id": "uuid",
    "status": "pending",
    "table_number": "12"
  }
}
```

#### Get Session Auth

```http
GET /api/public/selfservice/{hash}/getSessionAuth
```

**Response (200):**
```json
{
  "tenant": {
    "id": "uuid",
    "name": "Restaurant Name",
    "slug": "restaurant-slug"
  },
  "auth": {
    "tenantSettings": {},
    "tenantImages": {}
  },
  "systemValues": {
    "point_of_sales": [],
    "selfservice": {
      "tenant_id": "uuid",
      "session_hash": "DFJNL",
      "table_number": "12"
    }
  },
  "redirectTo": "/public/selfservice/tab/create"
}
```

**Error Responses:**

| Code | Reason |
|------|--------|
| 403 | Client identity mismatch |
| 404 | Session not found |
| 410 | Session expired |

### Tab Endpoints

#### Create Tab (Order)

```http
POST /api/public/selfservice/tab
Content-Type: application/json

{
  "selfservice_session": "DFJNL",
  "order": {
    "items": [
      {
        "product_id": "uuid",
        "quantity": 2,
        "modifiers": []
      }
    ]
  }
}
```

#### List Tabs

```http
GET /api/public/selfservice/tab?selfservice_session=DFJNL
```

---

## Database Schema

### self_service_sessions Table

```sql
CREATE TABLE self_service_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hash VARCHAR(10) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    customer_name VARCHAR(255) NULL,
    table_number VARCHAR(50) NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    meta JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_hash (hash)
);
```

### Entity Relationship

```mermaid
erDiagram
    TENANT ||--o{ SELF_SERVICE_SESSION : has
    SELF_SERVICE_SESSION ||--o{ ORDER : creates
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER_ITEM }o--|| PRODUCT : references
    TENANT ||--o{ PRODUCT : owns
    
    TENANT {
        uuid id PK
        string name
        string slug UK
        json settings
    }
    
    SELF_SERVICE_SESSION {
        bigint id PK
        string hash UK
        uuid tenant_id FK
        string table_number
        enum status
        json meta
    }
    
    ORDER {
        bigint id PK
        string brokerable_type
        bigint brokerable_id
        uuid tenant_id FK
    }
    
    PRODUCT {
        uuid id PK
        uuid tenant_id FK
        string name
        decimal price
    }
```

---

## Security Considerations

### Session Security

| Measure | Implementation |
|---------|----------------|
| **Unique Hash** | 5-character alphanumeric, collision-free |
| **IP Binding** | Session locked to first activating IP |
| **User Agent Check** | Secondary validation via browser fingerprint |
| **10-Hour Expiration** | Prevents indefinite session abuse |
| **Soft Delete** | Sessions never truly deleted for audit |

### API Security

| Measure | Implementation |
|---------|----------------|
| **Public Routes** | No auth token required for kiosk access |
| **Session Validation** | Every request validates session ownership |
| **Delete Disabled** | Frontend prevents delete operations |
| **Tenant Isolation** | Sessions scoped to single tenant |

### Client-Side Security

| Measure | Implementation |
|---------|----------------|
| **localStorage** | Session hash stored locally |
| **No Sensitive Data** | Only session hash, no passwords |
| **HTTPS Required** | All API calls over TLS |

---

## Comparison: Mall vs Self-Service

| Aspect | Mall | Self-Service |
|--------|------|--------------|
| **Broker** | Mall (multi-tenant) | Tenant (single) |
| **Products** | From mall.tenants | From tenant directly |
| **URL Pattern** | `/mall/:slug/s/:hash` | `/selfservice/:slug/s/:hash` |
| **Tab Structure** | Master + Tenant tabs | Simple tabs |
| **API Prefix** | `/public/mall/` | `/public/selfservice/` |
| **Session Model** | MallSession | SelfServiceSession |

---

## Related Documentation

- [User Guide](./SELFSERVICE_USER_GUIDE.md)
- [Mall Application Flow](./KITCHNTABS_MALL_APPLICATION_FLOW.md)
- [Mall Auth Flow](./KITCHNTABS_MALL_AUTH_FLOW.md)
