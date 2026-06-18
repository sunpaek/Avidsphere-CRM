# Technical Architecture: Notification & Department-Routing System

## System Overview

The notification system enables sales activity to trigger automatic email notifications to relevant departments while maintaining a persistent notification history in the browser's localStorage.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   SaleForm       │         │ Notifications    │          │
│  │   Component      │─────→   │ Page/Center      │          │
│  └──────────────────┘         └──────────────────┘          │
│         ↓                              ↓                     │
│   [Save Sale]                   [View/Manage]                │
│         ↓                              ↑                     │
│         └──────────────────┬───────────┘                    │
│                            ↓                                 │
│                 ┌──────────────────────┐                    │
│                 │  notificationApi     │                    │
│                 │  (Service Layer)     │                    │
│                 └──────────────────────┘                    │
│                    ↓              ↓                          │
│         ┌──────────┴──────────┐  │                          │
│         ↓                     ↓  ↓                          │
│    Backend API         localStorage                         │
│    Calls               (Notifications)                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↑
         │                              │
    [Email                         [Read/Archive
      Service]                       Delete]
         ↓                              │
         └──────────────────┬───────────┘
                            ↓
         ┌──────────────────────────────┐
         │     Resend Email API         │
         │  (Email Delivery Provider)   │
         └──────────────────────────────┘
```

## Component Architecture

### 1. SaleForm → NotificationFields → notificationApi

```typescript
SaleForm
  ├─ State: notificationFlags (Partial<Sale>)
  ├─ Render: <NotificationFields />
  └─ On Save:
     ├─ saveSale(sale) → localStorage
     └─ notificationApi.routeNotifications(sale, customer)
        ├─ Concurrent API calls to backend
        └─ Create local notifications on success
```

### 2. notificationApi Service Layer

```typescript
notificationApi
  ├─ routeNotifications(sale, customer) → Promise<Map>
  │  ├─ Evaluate notification flags
  │  ├─ Evaluate auto-routing rules
  │  ├─ For each enabled route:
  │  │  ├─ Send POST to backend endpoint
  │  │  └─ Create local notification on success
  │  └─ Return results map
  │
  ├─ sendManagementNotification()
  ├─ sendDesignerNotification()
  ├─ sendSocialNotification()
  ├─ sendPrintTeamNotification()
  ├─ sendDigitalTeamNotification()
  └─ sendGeofencingNotification()
```

### 3. Data Flow: localStorage

```
localStorage
├─ avidSphere.customers
├─ avidSphere.sales (includes notifyX flags)
├─ avidSphere.reminders
├─ avidSphere.notifications ← [Notification objects created here]
├─ avidSphere.activities
├─ avidSphere.preferences
└─ avidSphere.notificationHistory
```

### 4. Notification Object Structure

```typescript
interface Notification {
  id: string                      // Unique ID
  recipientRole: string           // 'team'
  title: string                   // e.g., "New Sales Alert"
  message: string                 // e.g., "New sale for Blue Moon Bakery"
  relatedId?: string              // Sale ID
  relatedCustomerId?: string      // Customer ID
  priority?: 'Normal' | 'High'   // Priority level
  source?: string                 // e.g., 'management', 'designers'
  type?: string                   // 'sale_notification'
  read: boolean                   // Read status
  createdAt: string              // ISO timestamp
  archived?: boolean             // Archive status
}
```

## Routing Logic Flow

### Auto-Routing Rules (Execute After Manual Selection)

```
if (sale.saleCategory === 'Digital') {
  notifyDigitalTeam = true
  notifySocialMediaTeam = true
}

if (sale.saleCategory === 'Print') {
  notifyPrintTeam = true
}

if (sale.designRequired === 'Yes') {
  notifyDesigners = true
}

if (sale.designChangeRequired === 'Yes') {
  notifyDesigners = true
}
```

### Backend Routing Decision

```
For each department:
  if (sale.notify[Department] === true OR auto-routing matches) {
    → POST /api/send-[department]-email
    → Backend processes and sends email
    → On success: create local notification
  }
```

## Backend Integration Points

### Endpoint Contracts

All endpoints accept:
```json
POST /api/send-{department}-email
Content-Type: application/json

{
  "sale": {
    "id": "sale-...",
    "businessName": "...",
    "saleType": "...",
    "dollarAmount": 5000,
    "saleDate": "2026-06-16",
    "salesRepresentative": "Sunny",
    "designRequired": "Yes|No",
    "notes": "...",
    ...
  },
  "customer": {
    "id": "cust-...",
    "businessName": "...",
    "contactPerson": "...",
    "emailAddress": "...",
    ...
  }
}
```

Response:
```json
{
  "success": true|false,
  "message": "Email queued|failed",
  "data": { ... },
  "error": "Error message if failed"
}
```

### Email Service Pipeline

```
notificationApi.routeNotifications()
    ↓
POST /api/send-{department}-email
    ↓
emailController.validateSalePayload()
    ↓
emailController.send{Department}Email()
    ↓
emailService.send{Department}Notification()
    ↓
emailService.sendEmail()
    ↓
Resend.emails.send()
    ↓
Email Provider (Resend)
    ↓
Department Email Address
```

## State Management Flow

### SaleForm State

```typescript
// Before save
notificationFlags = {
  notifyManagement: false,
  notifyDesigners: true,
  notifyPrintTeam: false,
  notifyDigitalTeam: false,
  notifySocialMediaTeam: false,
  notifyGeofencing: false
}

// After save
sale = {
  ...
  notifyManagement: false,
  notifyDesigners: true,
  notifyPrintTeam: false,
  notifyDigitalTeam: false,
  notifySocialMediaTeam: false,
  notifyGeofencing: false
}

// Then routeNotifications() evaluates and routes
```

### localStorage Update Cycle

```
Current State (sale created)
    ↓
notificationApi.routeNotifications()
    ├─ Check each department flag
    ├─ POST to backend
    └─ readCRMData() + create notification + writeCRMData()
    ↓
Storage Updated
    ↓
STORAGE_UPDATE_EVENT dispatched
    ↓
useLocalStorageAdapter reload() triggered
    ↓
Component re-renders with new notifications
```

## Error Handling Strategy

### Graceful Degradation

1. **Backend Unavailable**: Sale still saves locally, notifications fail silently
2. **Invalid Email**: Backend returns error, notification creation skipped
3. **Partial Success**: Some departments notified, others fail independently
4. **API Rate Limit**: Request logged, notification queued locally

### Logging

```javascript
[notificationApi] POST /api/send-management-email
[notificationApi] Routed notification to management: success
[notificationApi] Created local notification: notif-xxx
[notificationApi] Error routing to designers: {...error...}
```

## Performance Considerations

1. **Concurrent API Calls**: All enabled notifications sent in parallel
2. **localStorage Operations**: Batched writes after all API calls complete
3. **Re-render Optimization**: Single re-render per notification center action
4. **No Polling**: Event-based updates only

## Security & Validation

1. **Frontend**: Type-safe TypeScript interfaces
2. **Backend**: Payload validation in emailController
3. **Email Addresses**: Configured in backend/.env (not user input)
4. **API Key**: Stored in backend/.env (never exposed to frontend)

## Testing Strategy

### Unit Tests (Recommended)
- notificationApi routing logic
- Notification filtering/sorting
- localStorage read/write operations

### Integration Tests (Recommended)
- Full sale creation → notification flow
- Backend API call success/failure
- localStorage persistence

### Manual Testing
- Create sale with various notification flags
- Verify backend emails sent (if configured)
- Verify local notifications created
- Test notification actions (read/archive/delete)

## Deployment Checklist

- [ ] Backend running and accessible
- [ ] RESEND_API_KEY configured in backend/.env
- [ ] Email addresses configured in emailService.js
- [ ] Frontend environment pointing to correct backend
- [ ] localStorage not cleared on page load
- [ ] Network requests allowed to backend
- [ ] Notification permissions (if browser notifications added later)

## Future Architecture Improvements

### Move to Backend-Driven Notifications
```
Frontend: Sale Creation
    ↓
Backend: Webhook/Event Handler
    ├─ Evaluate notification rules
    ├─ Send emails
    ├─ Persist to database
    └─ Push to connected clients
    ↓
Frontend: Real-time notification via WebSocket
```

### Database Schema
```sql
notifications (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales,
  customer_id UUID REFERENCES customers,
  recipient_role VARCHAR,
  title VARCHAR,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  archived_at TIMESTAMP
)
```
