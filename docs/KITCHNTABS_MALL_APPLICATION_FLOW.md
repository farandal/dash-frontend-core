# KitchnTabs Mall Application Flow

## Overview

KitchnTabs Mall is a public-facing food court ordering application that allows customers to browse multiple restaurant menus and place orders by scanning a QR code. This document describes the complete application flow, component architecture, and data flow.

## Application Entry Point

### Bootstrap Component (`KitchnTabsMallBootstrap.tsx`)

The bootstrap component is the main entry point that determines which application variant to render based on authentication state and URL pattern.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KitchnTabsMallBootstrap                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Decision Logic                                   │    │
│  │                                                                      │    │
│  │  1. Check isAuthenticated (Redux auth state)                        │    │
│  │  2. Check isSessionUrl (matches /:mallSlug/s/:sessionId pattern)    │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│           ┌──────────────────┼──────────────────┐                           │
│           │                  │                  │                           │
│           ▼                  ▼                  ▼                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │  Authenticated  │ │  Session URL    │ │ Unauthenticated │               │
│  │  (Admin User)   │ │  (Guest User)   │ │ (Public Pages)  │               │
│  │                 │ │                 │ │                 │               │
│  │ KitchnTabs      │ │ MallClient      │ │ KitchnTabs      │               │
│  │ PrivateApp      │ │ Wrapper +       │ │ PublicApp       │               │
│  │ (Admin Panel)   │ │ PrivateApp      │ │ (Landing/Login) │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### URL Pattern Detection

The bootstrap component detects session URLs using a regex pattern:

```typescript
// Matches: /malltest/s/DFJNL, /foodcourt/s/ABC12, etc.
const isSessionUrl = /^\/[^/]+\/s\/[A-Z0-9]{5,}/i.test(pathname);
```

**URL Patterns Supported:**
- `/:mallSlug/s/:sessionId/*` - Full mall session URL (e.g., `/malltest/s/DFJNL/tab`)
- `/:sessionId` - Direct session hash (legacy, e.g., `/DFJNL`)

### Props Configuration

The bootstrap provides different configurations for admin vs guest users:

```typescript
// Admin user configuration
const privateAppProps = {
    customAuthProvider: DASHMallAuthProvider,      // Full auth with login
    customDataProvider: DASHMallDataProvider,      // Admin API endpoints
    customResources: KitchnTabsMallResources,
    AdminHook: () => <MainAppHookComponent />
};

// Guest user configuration (mall ordering)
const publicAppProps = {
    customAuthProvider: DASHMallClientAuthProvider,  // Guest auth (always authenticated)
    customDataProvider: DASHMallClientDataProvider,  // Public API endpoints
    customResources: KitchnTabsMallResources,
    AdminHook: () => <><PublicSessionAppHookComponent/><MallAppMediator/></>
};
```

---

## MallClientWrapper Component

### Purpose

`MallClientWrapper` is a Higher-Order Component (HoC) that:
1. Parses session parameters from the URL
2. Validates the session with the backend API
3. Sets up the WebSocket connection for real-time updates
4. Bridges WebSocket events to child components

### Architecture Note

This component runs **BEFORE** React Router is initialized, so it cannot use `useParams()`. It parses the URL directly from `window.location`.

### Component Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MallClientWrapper                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. URL PARSING                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  parseUrlParams()                                                    │    │
│  │  - Extract mallSlug and sessionId from pathname                     │    │
│  │  - Calculate sessionBasePath for React Router                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  2. SESSION STORAGE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  - Store sessionId in localStorage ('mall-session-hash')            │    │
│  │  - Store mallSlug in localStorage ('mall-slug')                     │    │
│  │  - Pre-set 'authenticated' = 'true' for React Admin routing         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  3. API VALIDATION                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  GET /public/mall/{sessionId}/getSessionAuth                        │    │
│  │                                                                      │    │
│  │  Success: Store tenantData, set isValid=true                        │    │
│  │  Failure: Show error (410=expired, 404=not found, etc.)             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  4. WEBSOCKET SETUP                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  MallSessionEchoProvider                                            │    │
│  │  └── MallEchoBridgeWrapper                                          │    │
│  │       └── MallEchoBridgeProvider                                    │    │
│  │            └── KitchnTabsPrivateApp (children)                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Session Validation States

| State | Description | UI Shown |
|-------|-------------|----------|
| `isValidating: true` | API call in progress | Loading spinner |
| `isValid: true` | Session validated successfully | Main application |
| `isValid: false` | Validation failed | Error message |

### Error Handling

| HTTP Status | Error Message | Action |
|-------------|---------------|--------|
| 410 | Session expired (10 hours) | Show expiration time |
| 404 | Session not found | Show error |
| 403 | Access denied | Show error |
| 500 | Server error | Show retry option |

---

## Data Provider Configuration

### DASHMallClientDataProvider

The data provider for mall client maps resources to public API endpoints and automatically injects session filters.

```typescript
// Resource path mapping
const RESOURCE_PATH_MAP = {
    'tab': 'public/mall/tab',
    'stores': 'public/mall/stores',
    'products': 'public/mall/products',
};

// Automatic filter injection
const addMallIdToParams = (params) => {
    return {
        ...params,
        filter: {
            ...params.filter,
            mall_id: getMallId(),        // From systemValues
            mall_session: getSessionId(), // From localStorage
        },
    };
};
```

### Key Methods

| Method | Description |
|--------|-------------|
| `getList` | Fetches list with mall_session filter auto-injected |
| `getOne` | Fetches single record with session context |
| `create` | Creates order with mall_id and mall_session injected |
| `delete` | **Disabled** - throws error for public client |

---

## Component Hierarchy

```
KitchnTabsMallBootstrap
├── [Authenticated] KitchnTabsPrivateApp (Admin)
│   └── React-Admin with full CRUD capabilities
│
├── [Session URL] MallClientWrapper
│   ├── MallSessionEchoProvider (WebSocket connection)
│   │   └── MallEchoBridgeWrapper
│   │       └── MallEchoBridgeProvider (Event bridge to kt-mall package)
│   │           └── KitchnTabsPrivateApp (Guest mode)
│   │               └── React-Admin with public resources
│   │                   ├── MallTabsContext (contextComponent)
│   │                   │   └── MallClientTabsProvider
│   │                   │       └── MallClientTabsList
│   │                   └── MallOrderProducts
│
└── [Public] KitchnTabsPublicApp
    └── Landing pages, login, registration
```

---

## Resource Configuration

### MallClientAppResources

The resource configuration defines what the mall client can access:

```typescript
const MallClientAppResources = [
    {
        group: "Haz tu orden aquí!",
        roles: ["Public"],
        model: "tab",                              // Maps to public/mall/tab
        redirect: "create",                        // Start at order creation
        label: "Haz tu orden aquí!",
        schema: MallTabSchema,
        contextComponent: MallTabsContext,         // Provides notification context
        dataGridComponent: MallClientTabsList,     // Custom order list
        
        // Form validation - inject customer data before submit
        beforeSubmit(values) {
            const orderData = dashStorage.getItem('orderData');
            const { name, tableNumber } = JSON.parse(orderData);
            values.customer_name = name;
            values.table_number = tableNumber;
            return values;
        },
        
        // Error handling - show customer data modal if missing
        onError(mode, error) {
            if (error.message === "MISSING_SESSION_DATA") {
                window.dispatchEvent(new CustomEvent('enter-public-order-data'));
            }
        },
    },
];
```

---

## Customer Order Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER ORDER FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: QR Code Scan                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Customer scans QR code → Browser opens URL                         │    │
│  │  Example: https://mall.example.com/malltest/s/DFJNL                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  STEP 2: Session Validation                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  MallClientWrapper validates session with backend API               │    │
│  │  - Checks session exists and is not expired                         │    │
│  │  - Retrieves mall configuration and tenant list                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  STEP 3: Store Selection                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Customer sees list of restaurants in the mall                      │    │
│  │  - Each store shows products, availability, logos                   │    │
│  │  - Products can be filtered by store/category                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  STEP 4: Product Selection                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Customer adds products from one or more stores                     │    │
│  │  - Products grouped by tenant for multi-restaurant orders           │    │
│  │  - Modifiers and notes can be added                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  STEP 5: Customer Data Entry (MallAppMediator)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Modal prompts for customer name and table number                   │    │
│  │  - Data stored in localStorage for order creation                   │    │
│  │  - Triggered by beforeSubmit validation                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  STEP 6: Order Submission                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  POST /public/mall/tab                                              │    │
│  │  - Creates master tab under mall manager tenant                     │    │
│  │  - Creates tenant tabs for each restaurant                          │    │
│  │  - Notifies restaurants via WebSocket and FCM                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  STEP 7: Real-Time Tracking                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Customer sees order status updates in real-time                    │    │
│  │  - Progress bars per restaurant                                     │    │
│  │  - Toast notifications on status changes                            │    │
│  │  - Status: CREATED → CONFIRMED → IN_PREPARATION → PREPARED → DELIVERED │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Interfaces

### ITab (Order/Tab Record)

```typescript
interface ITab {
    id: number;
    tenant_id: string;
    status: 'CREATED' | 'CONFIRMED' | 'IN_PREPARATION' | 'PREPARED' | 'DELIVERED' | 'CLOSED' | 'CANCELLED';
    delivery_method: string;
    note?: string;
    is_master_tab: boolean;
    master_tab_id?: number;
    brokerable_type: string;  // 'MallSession'
    brokerable_id: number;    // Session ID
    order?: {
        id: number;
        items: IOrderItem[];
        total: number;
    };
    tenant_tabs?: ITenantTab[];  // Child tabs per restaurant
    progress?: number;           // 0-100 calculated progress
}
```

### ITenantTab (Restaurant-specific Order)

```typescript
interface ITenantTab {
    id: number;
    tenant_id: string;
    tenant_name: string;
    status: string;
    progress: number;
    items: IOrderItem[];
}
```

---

## File Structure

```
apps/kitchntabs-mall/
├── src/
│   ├── KitchnTabsMallBootstrap.tsx      # Main entry point
│   ├── KitchnTabsMallRoutes.tsx         # Route definitions
│   ├── KitchnTabsMallResources.tsx      # Resource configurations
│   │
│   ├── components/
│   │   └── mall/
│   │       └── MallClientWrapper.tsx    # Session validation & WebSocket setup
│   │
│   ├── contexts/
│   │   ├── MallSessionEchoContext.tsx   # WebSocket subscription
│   │   ├── MainAppHookComponent.tsx     # Admin hooks
│   │   └── PublicSessionAppHookComponent.tsx  # Guest hooks
│   │
│   ├── dash-extensions/
│   │   └── config/
│   │       ├── DASHMallAuthProvider.tsx       # Admin auth
│   │       ├── DASHMallClientAuthProvider.tsx # Guest auth
│   │       ├── DASHMallDataProvider.tsx       # Admin data
│   │       └── DASHMallClientDataProvider.tsx # Guest data
│   │
│   └── core/
│       ├── KitchnTabsPrivateApp.tsx     # React Admin app
│       └── KitchnTabsPublicApp.tsx      # Public pages

packages/kt-mall/
├── src/
│   ├── components/
│   │   ├── MallClientTabsList.tsx       # Order list with progress
│   │   ├── MallClientTabsContext.tsx    # Notification context
│   │   ├── MallTabsContext.tsx          # Resource context wrapper
│   │   ├── MallOrderProducts.tsx        # Product selection
│   │   ├── MallSessionOrderProgress.tsx # Progress display
│   │   └── MallAppMediator.tsx          # Customer data modal
│   │
│   ├── contexts/
│   │   └── MallEchoBridgeContext.tsx    # Event bridge to package
│   │
│   └── schemas/
│       └── MallTabSchema.tsx            # Form/list schema
```

---

## Related Documentation

- [WebSocket Messaging System](./KITCHNTABS_MALL_WEBSOCKET_SYSTEM.md)
- [Guest Authentication Flow](./KITCHNTABS_MALL_AUTH_FLOW.md)
- [Backend Mall API Documentation](./MALL_BACKEND_API.md)
