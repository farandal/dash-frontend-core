# Tab Resource - Technical Documentation

## Overview

The Tab Resource is a comprehensive Point of Sale (POS) system for restaurant order management. It provides three specialized interfaces for different user roles and supports the complete order lifecycle from creation to closure.

**Version:** 2.0  
**Last Updated:** December 2024  
**Package:** `kt-tabs`

---

## Architecture

### File Structure

```
kt-tabs/
├── components/
│   ├── Tab/
│   │   ├── TabOrderProductsSelector.tsx    # Main product selection component
│   │   ├── TabContext.tsx                  # Context providers (TabsContext, MallTabsContext)
│   │   ├── TabAgentToolbar.tsx             # AI/Voice command toolbar
│   │   ├── ProductSearchBox.tsx            # Product search functionality
│   │   ├── CategorySelector.tsx            # Category filter chips
│   │   ├── CategoryCarousel.tsx            # Carousel for categories
│   │   ├── ViewOrder.tsx                   # Order summary view
│   │   ├── OrderProductsView.tsx           # Read-only products display
│   │   ├── OrderProductsEdit.tsx           # Editable products list
│   │   ├── ProductModifiers.tsx            # Modifier groups dialog
│   │   ├── ViewMarketplaceDetail.tsx       # Marketplace order details
│   │   ├── TabTotalAmountField.tsx         # Total amount display
│   │   └── TabActionsButtons.tsx           # Status action buttons
│   ├── contexts/
│   │   └── TabManagerContext.tsx           # Tab state management
│   ├── TabsList.tsx                        # Staff interface data grid
│   ├── KitchenTabsList.tsx                 # Kitchen interface data grid
│   ├── TabStatus.tsx                       # Status display/edit component
│   └── TabsDataGrid.tsx                    # Generic data grid wrapper
├── interfaces/
│   ├── ITab.ts                             # Tab interface definitions
│   ├── ITabProduct.ts                      # Product in tab interface
│   └── ITabNotificationFormat.ts           # Notification format
├── resources/
│   └── tabResource.tsx                     # Resource configuration
├── schemas/
│   └── tabSchema.ts                        # Form schema definition
└── docs/
    ├── TAB_RESOURCE_TECHNICAL.md           # This file
    └── TAB_RESOURCE_USER_GUIDE.md          # Non-technical guide
```

---

## Resource Configurations

The Tab Resource exports three resource configurations:

### 1. `tab/tab-admin` - Admin Interface

```typescript
{
    model: "tab/tab-admin",
    roles: ["System", "Tenant", "Staff"],
    features: [
        "Full CRUD operations",
        "Advanced filtering by status",
        "Bulk operations",
        "Pagination (20, 40, 60, 100 items)"
    ]
}
```

**Use Case:** Full administrative control for managers and system admins.

### 2. `tab/tab` - Staff Interface

```typescript
{
    model: "tab/tab",
    roles: ["System", "Tenant", "Staff"],
    features: [
        "Real-time updates via WebSocket",
        "Tab creation with product selection",
        "Status management",
        "Payment processing",
        "Custom layout (two-column on desktop)"
    ],
    dataGridComponent: TabsList
}
```

**Use Case:** Operational tab management for restaurant staff.

### 3. `tab/kitchentab` - Kitchen Interface

```typescript
{
    model: "tab/kitchentab",
    roles: ["Tenant", "Kitchen"],
    features: [
        "Simplified read-only view",
        "Order cards with timers",
        "Status progression buttons",
        "Print/download functionality"
    ],
    dataGridComponent: KitchenTabsList
}
```

**Use Case:** Kitchen display system (KDS) for cooks and kitchen staff.

---

## Core Components

### TabOrderProductsSelector

The main product selection component with two rendering modes:

#### Configuration Interface

```typescript
interface ITabOrderProductsSelectorConfig {
    // ========== HORIZONTAL SCROLL MODE ==========
    useHorizontalScroll?: boolean;           // Enable native CSS scrolling (default: true)
    horizontalScrollCardWidth?: number;      // Card width in pixels (default: 140)
    horizontalScrollCardHeight?: number;     // Card height in pixels (default: 180)
    horizontalScrollRowsXs?: number;         // Rows on mobile (default: 1)
    horizontalScrollRowsSm?: number;         // Rows on tablet (default: 2)
    horizontalScrollRowsMd?: number;         // Rows on desktop (default: 2)
    
    // ========== PAGINATION MODE ==========
    itemsPerPageXs?: number;                 // Items per page on xs screens
    itemsPerPageSm?: number;                 // Items per page on sm screens
    itemsPerPageMd?: number;                 // Items per page on md screens
    itemsPerPageLg?: number;                 // Items per page on lg screens
    gridColumnsXs?: number;                  // Grid columns on xs screens
    gridColumnsSm?: number;                  // Grid columns on sm screens
    gridColumnsMd?: number;                  // Grid columns on md screens
    gridColumnsLg?: number;                  // Grid columns on lg screens
    
    // ========== COMMON OPTIONS ==========
    showPrice?: boolean;                     // Display product prices
    categoryResource?: string;               // API endpoint for categories
    productsResource?: string;               // API endpoint for products
    categoryCacheDuration?: number;          // Cache TTL for categories (ms)
    productsCacheDuration?: number;          // Cache TTL for products (ms)
    disableCache?: boolean;                  // Disable localStorage caching
    hideCategorySelector?: boolean;          // Use external CategorySelector
    hideNavigationButtons?: boolean;         // Hide carousel navigation arrows
}
```

#### Horizontal Scroll Mode (Recommended for Mobile)

Uses native CSS `overflow-x: auto` with `scroll-snap-type` for smooth, performant scrolling:

```typescript
config: {
    useHorizontalScroll: true,
    horizontalScrollCardWidth: 140,
    horizontalScrollCardHeight: 180,
    horizontalScrollRowsXs: 1,  // 1 row on mobile
    horizontalScrollRowsSm: 2,  // 2 rows on tablet+
    horizontalScrollRowsMd: 2,
}
```

**Benefits:**
- Native scroll performance (no JavaScript animation)
- iOS momentum scrolling (`-webkit-overflow-scrolling: touch`)
- Scroll snap for precise card alignment
- Responsive row configuration

#### Pagination Mode (Legacy)

Uses JavaScript-based pagination with arrow navigation:

```typescript
config: {
    useHorizontalScroll: false,
    itemsPerPageXs: 3,
    itemsPerPageSm: 6,
    itemsPerPageMd: 6,
    itemsPerPageLg: 12,
}
```

---

### TabManagerContext

Central state management for tab operations:

```typescript
interface TabManagerContextValue {
    // State
    tab: ITab | null;
    products: Product[];
    selectedCategory: string | null;
    searchQuery: string;
    isLoading: boolean;
    
    // Actions
    addProduct: (product: Product, modifiers?: SelectedModifiers) => void;
    removeProduct: (productId: number, lineId: string) => void;
    updateQuantity: (productId: number, lineId: string, quantity: number) => void;
    setSelectedCategory: (categoryId: string | null) => void;
    setSearchQuery: (query: string) => void;
    
    // Configuration
    enableInfiniteScroll: boolean;
    showPrice: boolean;
    productsResource: string;
}
```

**Providers:**

| Provider | Mode | Purpose |
|----------|------|---------|
| `TabsListProvider` | list | WebSocket listener for list refresh |
| `TabsEditProvider` | edit | WebSocket listener for edit view |
| `TabManagerProvider` | create/edit | Full product management |

---

### TabContext Providers

```typescript
// Standard tabs context
export const TabsContext: IDashAutoAdminResourceConfig["contextComponent"]

// Mall/multi-tenant context
export const MallTabsContext: IDashAutoAdminResourceConfig["contextComponent"]
```

---

## Schema Definition

The `tabSchema` defines all form fields and their behavior:

### Tabs (Form Groups)

| Tab | Purpose |
|-----|---------|
| `Productos` | Product selection and AI toolbar |
| `Comanda` | Order details, status, delivery info |
| `Marketplace` | External marketplace order data |
| `Datos` | Timestamps and metadata |

### Key Fields

```typescript
const tabSchema: IDashAutoAdminAttribute[] = [
    // AI/Voice toolbar
    { attribute: 'ai_toolbar', component: TabAgentToolbar, tab: 'Productos' },
    
    // Product search
    { attribute: 'product_search', component: ProductSearchBox, tab: 'Productos' },
    
    // Category filter
    { attribute: 'category_filter', component: CategorySelector, tab: 'Productos' },
    
    // Product selector (main component)
    { attribute: 'products', component: TabOrderProductsSelector, tab: 'Productos' },
    
    // Order items list
    { attribute: 'products', component: OrderProductsField, tab: 'Comanda' },
    
    // Status and actions
    { attribute: 'status', component: TabStatus, tab: 'Comanda' },
    { attribute: 'actions', component: TabActionButtonsField, tab: 'Comanda' },
    
    // Delivery info
    { attribute: 'delivery_method', component: DeliveryMethodField, tab: 'Comanda' },
    { attribute: 'table_number', component: TableNumberField, tab: 'Comanda' },
    
    // Order summary
    { attribute: 'order_summary', component: ViewOrder, tab: 'Productos' },
    { attribute: 'order.total_amount', component: TabTotalAmountField, tab: 'Productos' },
];
```

---

## Order Workflow

### Status Progression

```
CREATED → CONFIRMED → IN_PREPARATION → PREPARED → DELIVERED → CLOSED
                                                           ↓
                                                      CANCELLED
```

### Status Definitions

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| `CREATED` | Order placed, awaiting confirmation | Confirm, Cancel |
| `CONFIRMED` | Order confirmed, in queue | Start preparation |
| `IN_PREPARATION` | Being prepared in kitchen | Mark prepared |
| `PREPARED` | Ready for delivery/pickup | Deliver |
| `DELIVERED` | Handed to customer | Close, Cancel |
| `CLOSED` | Transaction complete | None |
| `CANCELLED` | Order cancelled | None |

---

## Real-Time Updates

### WebSocket Integration

The Tab Resource uses Laravel Echo for real-time updates:

```typescript
// Listening for tab updates
const { lastEvent } = useContext(LaravelEchoContext);

useEffect(() => {
    if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab") {
        // Handle notification types:
        // - MallSessionTabCreationNotification
        // - TabChannelNotification
        // - TenantChannelMessageNotification
        refresh();
    }
}, [lastEvent]);
```

### Notification Events

| Event | Trigger | Action |
|-------|---------|--------|
| `MallSessionTabCreationNotification` | New mall order | Refresh list, show toast |
| `TabChannelNotification` | Tab status change | Refresh current view |
| `TenantChannelMessageNotification` | Tenant broadcast | Show notification |

---

## Caching Strategy

### LocalStorage Caching

```typescript
// Category cache key
const CATEGORY_CACHE_KEY = 'tab_products_selector_categories';

// Products by category cache key
const CATEGORY_PRODUCTS_CACHE_KEY = 'tab_products_selector_category_products';

// Default cache duration: 1 hour
const DEFAULT_CACHE_DURATION = 60 * 60 * 1000;
```

### Cache Configuration

```typescript
config: {
    categoryCacheDuration: 60 * 60 * 1000,  // 1 hour
    productsCacheDuration: 60 * 60 * 1000,  // 1 hour
    disableCache: false,
}
```

---

## Layouts

### Custom Form Layouts

The Staff interface uses custom layouts for responsive design:

```typescript
// Edit layout - two columns on desktop
editLayout(render) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                {render("Productos")}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                {render("Comanda")}
            </Grid>
        </Grid>
    );
}
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tab/tab` | GET | List tabs |
| `/tab/tab` | POST | Create tab |
| `/tab/tab/{id}` | GET | Get tab details |
| `/tab/tab/{id}` | PUT | Update tab |
| `/tab/tab-admin` | GET | Admin list with advanced filters |
| `/tab/kitchentab` | GET | Kitchen-optimized list |
| `/ecommerce/category` | GET | Product categories |
| `/ecommerce/product` | GET | Products list |

---

## Integration with External Systems

### Marketplace Support

The Tab Resource integrates with external ordering platforms:

- **Uber Eats** - Order import and status sync
- **Jumpseller** - E-commerce order handling
- **Custom marketplaces** - Via `brokerable` polymorphic relationship

### ViewMarketplaceDetail Component

Displays marketplace-specific order information:

```typescript
{
    tab: 'Marketplace',
    attribute: 'order',
    component: ViewMarketplaceDetail,
}
```

---

## Performance Optimizations

### Implemented Optimizations

1. **Horizontal Scroll Mode** - Native CSS scrolling instead of JavaScript pagination
2. **LocalStorage Caching** - Reduces API calls for categories and products
3. **Responsive Loading** - Different item counts based on screen size
4. **Skeleton Loading** - Shows placeholder UI during data fetch
5. **Lazy Category Loading** - Products loaded per category on demand

### Memory Management

- Uses `useMemo` for expensive calculations
- Implements proper cleanup in `useEffect` hooks
- Avoids re-renders with `useCallback` for event handlers

---

## Testing

### Key Test Scenarios

1. **Product Selection Flow**
   - Select category → Load products → Add to cart → Apply modifiers

2. **Status Transitions**
   - Verify each status transition is valid
   - Check timestamp updates on status change

3. **Real-Time Updates**
   - Verify WebSocket events trigger refreshes
   - Test notification display

4. **Mobile Performance**
   - Test horizontal scroll smoothness
   - Verify touch events work correctly

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Products not loading | Cache stale | Clear localStorage cache |
| WebSocket not updating | Channel not subscribed | Check Laravel Echo config |
| Slow pagination | Too many products per page | Enable horizontal scroll mode |
| Modifiers not saving | Missing line_id | Ensure unique line IDs generated |

### Debug Logging

Enable debug logging in TabContext:

```typescript
console.log(`🟣 [TabsContext] Rendering`, {
    mode,
    tabId: tab?.id,
    hasTab: !!tab,
    hasOrder: !!tab?.order
});
```

---

## Changelog

### v2.0.0 (December 2024)

- Added horizontal scroll mode for mobile optimization
- Responsive row configuration (xs/sm/md breakpoints)
- Fixed loading skeleton to respect `hideCategorySelector`
- Improved caching strategy with configurable TTL

### v1.0.0 (Initial Release)

- Basic tab management functionality
- Pagination-based product selector
- Real-time updates via WebSocket
- Multi-interface support (Admin/Staff/Kitchen)
