# Tab Resource - User Guide

## What is the Tab System?

The Tab System is your restaurant's digital command center for managing orders. Think of a "Tab" as a digital version of a paper order ticket - it tracks what customers ordered, where it's going, and the status of preparation.

---

## Who Uses This System?

### 👨‍💼 Managers & Administrators

Access the **full admin panel** to:
- View all orders across all time periods
- Filter orders by status
- Export data for reports
- Manage bulk operations

### 👨‍🍳 Kitchen Staff

Access the **Kitchen Display** to:
- See incoming orders in real-time
- View order details and special instructions
- Update order status as you cook
- Track preparation time with timers

### 🧑‍💼 Front-of-House Staff

Access the **Staff Interface** to:
- Create new orders for customers
- Browse products by category
- Add items to orders
- Process payments
- Manage deliveries

---

## Order Lifecycle

Every order goes through these stages:

```
📝 CREADO (Created)
    ↓
✅ CONFIRMADO (Confirmed)
    ↓
🍳 EN PREPARACIÓN (In Preparation)
    ↓
🍽️ PREPARADO (Ready)
    ↓
🚗 ENTREGADO (Delivered)
    ↓
✔️ CERRADO (Closed)
```

### What Each Status Means

| Status | Icon | What's Happening |
|--------|------|------------------|
| **Creado** | 📝 | Order just entered the system |
| **Confirmado** | ✅ | Order verified and sent to kitchen |
| **En Preparación** | 🍳 | Kitchen is actively cooking |
| **Preparado** | 🍽️ | Food is ready for pickup/delivery |
| **Entregado** | 🚗 | Customer received their order |
| **Cerrado** | ✔️ | Payment complete, order archived |
| **Cancelado** | ❌ | Order was cancelled |

---

## Creating a New Order

### Step 1: Select Products

1. Open the **Tabs** section from the menu
2. Click **⊕ Crear tab** (Create Tab)
3. Browse products by scrolling horizontally
4. Use the category chips to filter (Todos, Entradas, Platos, etc.)

### Step 2: Add Items

1. **Tap a product card** to add it to the order
2. If the product has options (size, toppings, etc.), a popup will appear
3. Select your options and confirm
4. The product appears in the order summary on the right

### Step 3: Modify Quantities

- **Add more:** Tap the product card again
- **Remove:** Use the quantity controls in the order summary
- **Delete:** Set quantity to 0 or use the delete button

### Step 4: Set Delivery Details

1. Choose **Delivery Method**:
   - 🪑 Mesa (Table service)
   - 🛍️ Para llevar (Takeout)
   - 🚗 Delivery

2. Enter **Table Number** if applicable

3. Add any **Notes** for the kitchen

### Step 5: Save the Order

Click **Guardar** (Save) to create the order. It will appear in the kitchen display automatically!

---

## Using the Kitchen Display

### The Kitchen View

Each order appears as a card showing:
- Order number and table
- List of items with quantities
- Timer showing how long since order was placed
- Current status

### Updating Order Status

As you prepare orders:

1. **Order arrives** → Status is "Confirmado"
2. **Start cooking** → Tap to change to "En Preparación"
3. **Finish cooking** → Tap to change to "Preparado"
4. **Server picks up** → Status changes to "Entregado"

### Visual Indicators

- 🟢 **Green timer** = Order is on time
- 🟡 **Yellow timer** = Order taking longer than usual
- 🔴 **Red timer** = Order is delayed, prioritize!

---

## Mobile Experience

### Optimized for Touch

The system is designed for tablets and phones:

- **Swipe horizontally** to browse products
- **Large tap targets** for easy selection
- **Pull to refresh** for latest orders
- **Responsive layout** adapts to screen size

### Mobile Tips

1. **One row on phones** - Products display in a single scrollable row
2. **Two rows on tablets** - More products visible at once
3. **Smooth scrolling** - Just swipe, no buttons needed!

---

## Real-Time Updates

### Automatic Refresh

The system updates automatically when:
- A new order comes in
- An order status changes
- A payment is processed

### Notifications

You'll see a toast notification when:
- 🔔 New order received
- 📝 Order status updated
- ✅ Order completed

---

## Filtering Orders

### By Status

Use the status filter to show only:
- All orders
- Only "Creado" orders
- Only "En Preparación" orders
- etc.

### By Date

Administrators can filter by date range to find historical orders.

---

## Common Tasks

### Finding an Order

1. Go to **Tabs** list view
2. Look for the order number or table number
3. Use status filter if needed
4. Click/tap to open details

### Cancelling an Order

1. Open the order
2. Click **Cancelar** button
3. Confirm the cancellation
4. Order moves to "Cancelado" status

### Processing Payment

1. Open a "Entregado" order
2. Click **Cerrar** (Close)
3. Select payment method:
   - 💵 Efectivo (Cash)
   - 💳 Tarjeta (Card)
   - 🏦 Transferencia (Transfer)
4. Confirm payment
5. Order moves to "Cerrado"

---

## Tips & Best Practices

### For Kitchen Staff

✅ **DO:**
- Update status immediately when you start cooking
- Check special notes on each order
- Monitor timer colors for priority

❌ **DON'T:**
- Skip status updates
- Ignore delayed order alerts
- Close orders before they're picked up

### For Front-of-House

✅ **DO:**
- Double-check order before saving
- Add notes for special requests
- Verify delivery method

❌ **DON'T:**
- Create duplicate orders
- Forget table numbers
- Close orders before payment

### For Managers

✅ **DO:**
- Review daily order reports
- Monitor average preparation times
- Check cancelled orders for issues

❌ **DON'T:**
- Delete historical data
- Ignore recurring cancellations
- Skip end-of-day reconciliation

---

## Troubleshooting

### Products Not Loading

**Try:**
1. Pull to refresh
2. Switch categories and back
3. Close and reopen the app
4. Check internet connection

### Order Not Appearing in Kitchen

**Check:**
1. Is the order status "Confirmado"?
2. Is the kitchen display connected?
3. Try refreshing the kitchen view

### Can't Change Order Status

**Verify:**
1. You have the right permissions
2. The order isn't already closed
3. You're following the correct status sequence

---

## Need Help?

Contact your system administrator or IT support if you:
- Can't log in
- See error messages
- Need training on new features
- Find a bug or issue

---

## Quick Reference Card

| Action | How To |
|--------|--------|
| Create Order | Tabs → ⊕ Crear tab |
| Add Product | Tap product card |
| Remove Product | Quantity → 0 |
| Confirm Order | Save button |
| Update Status | Tap status button |
| Filter Orders | Use status dropdown |
| Cancel Order | Open → Cancelar |
| Close Order | Open → Cerrar → Payment |

---

*Document Version: 2.0 | December 2024*
