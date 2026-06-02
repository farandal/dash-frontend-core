# Tenancy Account & Billing Components

This directory contains React components for the tenancy billing panel in the FabLabOs Web private app.

## Components

### Account Management
- **TenancyAccountSettings.tsx** - Custom form component for tenancy JSON settings

### Subscription Management
- **CurrentSubscription.tsx** - Card displaying current plan with manage dropdown
- **SubscriptionPlansSelector.tsx** - Grid of available plans for upgrade/downgrade
- **TenancySubscriptionList.tsx** - Custom list combining current plan + available plans

### Invoices
- **InvoiceStatusBadge.tsx** - Colored status chip (Paid/Pending/Failed)
- **InvoiceActions.tsx** - Row actions for view/download

### Payment Methods (Outlined)
- **PaymentMethodCard.tsx** - Display component for stored payment methods
- **PaymentGatewayIntegration.tsx** - Documentation for gateway integration

## Schemas

Schemas are located in `src/resources/private/schemas/`:
- `tenancy_account.tsx`
- `tenancy_subscription.tsx`
- `tenancy_invoice.tsx`
- `tenancy_payment_method.tsx`

## Backend Endpoints

| Feature | Endpoint | Controller |
|---------|----------|------------|
| Account | `/api/tenancy/tenancy` | TenancyController |
| Subscription | `/api/tenancy/subscriptions` | TenancySubscriptionController |
| Invoices | `/api/tenancy/payments` | TenancyPaymentController |
| Payment Methods | `/api/tenancy/payment-methods` | TenancyPaymentMethodController |

## Integration Notes

Payment gateway integration requires:
1. Backend implementation of `PaymentGatewayContract`
2. Gateway registration in `SystemPaymentGateway`
3. Configuration via `TenancySystemPaymentGateway`
4. Frontend tokenization components (Stripe Elements, etc.)