
## TABS

Point of Sale (POS) system with kitchen display functionality, designed for restaurants that need to manage both in-house and third-party delivery orders efficiently.

### Core Functionality:
- Admin Interface: Full administrative control with advanced filtering and bulk operations
- Staff Interface: Operational tab management with real-time updates and payment processing
- Kitchen Interface: Simplified view focused on order preparation and status updates
### Key Features:

#### Multi-status Order Workflow:
```
CREATED → CONFIRMED → IN_PREPARATION → PREPARED → DELIVERED → CLOSED

```

#### Real-time Updates:
- WebSocket integration via LaravelEchoContext
- Live status updates across all interfaces
- Queue management for bulk operations

#### Marketplace Integration:
- Support for external platforms (Uber, Jumpseller)
- Marketplace-specific order handling

#### Product Customization:
- Modifier groups and options
- Dynamic pricing with adjustments
- Product images and descriptions

#### Payment Processing:
- Multiple payment methods (CASH, CARD, TRANSFER)
- Service fee calculations
- Payment status tracking

#### Kitchen Interface:
- Visual order cards with timers
- Print/download functionality
- Status progression buttons


### Component Dependency Graph

The Tabs feature is a comprehensive restaurant/food service management system that handles the complete order lifecycle from creation to closure. It provides different interfaces for various user roles (admin, staff, kitchen) and integrates with external marketplace platforms.

Component Dependency Graph
DASHResources.tsx
└── tabResource.tsx
    ├── tab/tab-admin (Admin Interface)
    │   └── ResourceTemplate
    │       └── tabSchema
    │
    ├── tab/tab (Staff Interface)
    │   ├── ResourceTemplate
    │   ├── TabsList.tsx (Custom DataGrid)
    │   │   ├── TabListItem.tsx
    │   │   │   ├── TabTimerClock.tsx
    │   │   │   ├── BoolSwitch.tsx
    │   │   │   └── DashResourceButton
    │   │   ├── QueueStatusIndicator.tsx (Queue management)
    │   │   ├── OperationQueue.tsx (Queue management)
    │   │   ├── DASHModal (Payment & Close dialogs)
    │   │   └── LaravelEchoContext (Real-time updates)
    │   └── tabSchema
    │
    └── tab/kitchentab (Kitchen Interface)
        ├── ResourceTemplate
        ├── KitchenTabsList.tsx (Custom DataGrid)
        │   ├── OrderProductsView.tsx
        │   │   └── ImagePlaceHolder.tsx
        │   ├── TabTimerClock.tsx
        │   ├── DashResourceButton
        │   └── LaravelEchoContext (Real-time updates)
        └── tabSchema

Core Components:
├── TabStatus.tsx
│   ├── ItemEdit (Status management)
│   ├── ItemView (Status display)
│   └── useFormContext
│
├── Order.tsx
│   ├── ViewOrder.tsx
│   │   └── OrderProductsView.tsx
│   └── EditOrder.tsx
│       ├── ProductModifiers.tsx
│       ├── ImagePlaceHolder.tsx
│       └── useFieldArray
│
├── OrderProducts.tsx
│   ├── OrderProductsView.tsx
│   ├── OrderProductsEdit.tsx
│   │   ├── ProductModifiers.tsx
│   │   ├── ImagePlaceHolder.tsx
│   │   └── Dialog (Modifier selection)
│   └── ListComponent
│
├── ViewMarketplaceDetail.tsx
│   ├── MUISimpleJsonTable.tsx
│   └── Accordion components
│
└── TabsDataGrid.tsx
    └── AutoDataGrid


