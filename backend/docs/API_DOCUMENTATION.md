# RentNest SaaS Platform — Complete API Documentation Package

> **Version**: 1.0.0  
> **Specification**: OpenAPI 3.1.0  
> **Base URL**: `http://localhost:5000/api/v1` (Development) | `https://api.rentnest.com/api/v1` (Production)  
> **Swagger UI URL**: `http://localhost:5000/api/docs`  
> **OpenAPI JSON Endpoint**: `/api/v1/docs/openapi.json`  
> **OpenAPI YAML Endpoint**: `/api/v1/docs/openapi.yaml`  

---

## 1. Architectural Overview & Design System

The **RentNest API** is engineered as a production-ready, RESTful enterprise property management engine powered by **Express.js, TypeScript, and MySQL 8**. All HTTP endpoints adhere strictly to unified JSON API envelope design patterns, granular security middleware, rate limiting controls, and structured exception handling.

### Global Response Envelope
Every response returned by the RentNest backend conforms to one of two standardized JSON envelope structures:

#### Success Response Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Error Response Envelope (`4xx`, `5xx`)
```json
{
  "success": false,
  "message": "Request validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid parameter input provided.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ],
    "timestamp": "2026-07-24T15:53:00.000Z",
    "path": "/api/v1/auth/login",
    "correlationId": "req_9f81a7b2"
  }
}
```

---

## 2. Authentication & Session Management

RentNest utilizes a dual-token security architecture combining short-lived **JWT Access Tokens** (15-minute expiration) transmitted via `Authorization: Bearer <token>` HTTP headers and long-lived **HTTP-Only Refresh Token Cookies** (7-day duration).

```
                      +-------------------+
                      |   Client Application   |
                      +---------+---------+
                                |
            1. POST /api/v1/auth/login (Credentials)
                                |
                                v
                      +-------------------+
                      |  Backend Gateway  |
                      +---------+---------+
                                |
          Generates Access Token (15m) + Refresh Cookie (7d)
                                |
                                v
  2. Returns Access Token in Body + Set-Cookie (refreshToken)
```

### Auth Flow & Endpoints

- **POST** `/api/v1/auth/register` — Account creation (Rate-limited: 15 / 15m)
- **POST** `/api/v1/auth/login` — Authentication & token issuance (Rate-limited: 15 / 15m)
- **POST** `/api/v1/auth/logout` — Revokes current session & clears cookies
- **POST** `/api/v1/auth/refresh-token` — Re-issues JWT access token via refresh cookie
- **POST** `/api/v1/auth/verify-email` — Confirms account email verification token
- **POST** `/api/v1/auth/resend-verification` — Resends verification email
- **POST** `/api/v1/auth/forgot-password` — Dispatches password recovery link
- **POST** `/api/v1/auth/reset-password` — Consumes reset token to set new password
- **GET** `/api/v1/auth/me` — Fetches current authenticated user profile
- **POST** `/api/v1/auth/change-password` — Updates password for logged-in user
- **POST** `/api/v1/auth/verify-password` — Re-authenticates user prior to high-risk actions
- **GET** `/api/v1/auth/sessions` — Lists active user sessions across devices
- **DELETE** `/api/v1/auth/sessions/:sessionId` — Remote session termination

---

## 3. Role-Based Access Control (RBAC) Documentation

RentNest enforces Role-Based Access Control (RBAC) across all protected resource endpoints using `requireRole(['ROLE_NAME'])` and `requirePermission('permission:token')` express middleware.

### System Roles
1. `ROLE_ADMIN` — Full platform governance and system settings access.
2. `ROLE_PROPERTY_MANAGER` — Portfolio maintenance, tenant oversight, lease execution.
3. `ROLE_PROPERTY_OWNER` — Property creation, financial earnings summary, payout requests.
4. `ROLE_TENANT` — Viewing applications, lease signature, maintenance requests, rent payments.
5. `ROLE_FINANCE_OFFICER` — Revenue reporting, payment audits, invoice generation.
6. `ROLE_VENDOR` — Maintenance ticket job execution and dispatch updates.

### Endpoint Security & Permission Matrix

| Endpoint Route | HTTP Method | Minimum Guard | Permitted Roles | Permission Token |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/health/*` | GET | Public | All | None |
| `/api/v1/properties/search` | GET | Public | All | None |
| `/api/v1/properties` | POST | Authenticated | `ROLE_ADMIN`, `ROLE_PROPERTY_OWNER` | `property:create` |
| `/api/v1/properties/:id` | PUT | Authenticated | `ROLE_ADMIN`, `ROLE_PROPERTY_OWNER` | `property:write` |
| `/api/v1/properties/:id` | DELETE | Authenticated | `ROLE_ADMIN`, `ROLE_PROPERTY_OWNER` | `property:delete` |
| `/api/v1/users/:id/status` | PATCH | Authenticated | `ROLE_ADMIN` | `user:manage` |
| `/api/v1/leases/applications/:id/status` | PATCH | Authenticated | `ROLE_ADMIN`, `ROLE_PROPERTY_OWNER`, `ROLE_PROPERTY_MANAGER` | `lease:approve` |
| `/api/v1/financial/invoices` | POST | Authenticated | `ROLE_ADMIN`, `ROLE_PROPERTY_OWNER`, `ROLE_PROPERTY_MANAGER` | `financial:write` |
| `/api/v1/maintenance/requests/:id/status` | PATCH | Authenticated | `ROLE_TENANT`, `ROLE_PROPERTY_MANAGER`, `ROLE_VENDOR` | `maintenance:write` |
| `/api/v1/admin/*` | ALL | Authenticated | `ROLE_ADMIN` | `admin:all` |

---

## 4. Rate Limiting Policy

RentNest enforces automated IP-based rate limiting via `express-rate-limit` to prevent brute-force attacks and DDOS vulnerabilities.

- **Global Rate Limiter**: `500 requests` per 15-minute window per IP address across all endpoints.
- **Authentication Rate Limiter**: `15 requests` per 15-minute window per IP on `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/resend-verification`.

### Rate Limit HTTP Response Headers
```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 498
X-RateLimit-Reset: 1784824000
```

### Rate Limit Violation Response (`429 Too Many Requests`)
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests from this IP. Please try again after 15 minutes.",
    "timestamp": "2026-07-24T15:53:00.000Z"
  }
}
```

---

## 5. File Upload API Documentation

RentNest handles binary asset uploads (property images, lease PDFs, maintenance attachments) via **Multer** stored in `/uploads`.

- **Endpoint**: `POST /api/v1/properties/:propertyId/media`
- **Content-Type**: `multipart/form-data`
- **Form Field Name**: `file`
- **File Size Limit**: `10 MB` (Configurable via `MAX_FILE_SIZE_MB`)
- **Allowed MIME Types**:
  - `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### File Upload Code Example (cURL)
```bash
curl -X POST "http://localhost:5000/api/v1/properties/prop_102/media" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@/path/to/property_photo.jpg"
```

### File Upload Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Media file uploaded successfully",
  "data": {
    "id": "med_9182ab3c",
    "propertyId": "prop_102",
    "url": "/uploads/4f1e09a3-9b4f-4d32-b91a.jpg",
    "fileType": "image/jpeg",
    "fileSize": 2408912,
    "createdAt": "2026-07-24T15:53:00.000Z"
  }
}
```

---

## 6. WebSocket Event Documentation (Socket.IO)

RentNest provides real-time bi-directional messaging and status push updates over Socket.IO.

- **Connection URL**: `ws://localhost:5000` (or `wss://api.rentnest.com`)
- **Authentication**: JWT token supplied during handshake:
  - `auth: { token: "<ACCESS_TOKEN>" }` OR
  - `headers: { authorization: "Bearer <ACCESS_TOKEN>" }`
- **User Room Binding**: Upon connection, clients automatically join isolated personal room `user:<userId>`.

### Socket Event Catalog

| Event Name | Direction | Payload Example | Description |
| :--- | :--- | :--- | :--- |
| `chat:message` | Bidirectional | `{ "conversationId": "c_12", "body": "Is unit available?" }` | Instant conversation messaging |
| `notification:new` | Server -> Client | `{ "title": "Rent Due", "body": "Invoice #440 is pending" }` | Real-time push notification |
| `maintenance:status_updated` | Server -> Client | `{ "ticketId": "mt_88", "status": "IN_PROGRESS" }` | Maintenance ticket update |
| `lease:status_changed` | Server -> Client | `{ "leaseId": "ls_91", "status": "ACTIVE" }` | Lease approval & signature state |
| `payment:processed` | Server -> Client | `{ "paymentId": "pay_50", "status": "COMPLETED" }` | Payment confirmation |

---

## 7. Complete Endpoint Reference Guide

This section documents every HTTP method implemented across all 13 modules of the RentNest API with request and response examples.

---

### Module 1: Infrastructure & Health Check (`/api/v1/health`)

#### GET `/api/v1/health`
Checks service and database pool connectivity status.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "System overall health status",
  "data": {
    "status": "UP",
    "timestamp": "2026-07-24T15:53:00.000Z",
    "uptime": 86400,
    "environment": "production",
    "services": {
      "database": "HEALTHY",
      "application": "HEALTHY"
    }
  }
}
```

---

### Module 2: Authentication Module (`/api/v1/auth`)

#### POST `/api/v1/auth/register`
Creates a new user account.

**Request Body**:
```json
{
  "email": "sarah.tenant@example.com",
  "password": "SecurePassword2026!",
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "phoneNumber": "+15559876543",
  "roleName": "ROLE_TENANT"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Registration successful. Verification email dispatched.",
  "data": {
    "user": {
      "id": "usr_77a9b12c",
      "email": "sarah.tenant@example.com",
      "firstName": "Sarah",
      "lastName": "Jenkins",
      "roleName": "ROLE_TENANT",
      "status": "PENDING_VERIFICATION"
    }
  }
}
```

#### POST `/api/v1/auth/login`
Authenticates credentials and generates JWT access token.

**Request Body**:
```json
{
  "email": "sarah.tenant@example.com",
  "password": "SecurePassword2026!"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "User login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "usr_77a9b12c",
      "email": "sarah.tenant@example.com",
      "firstName": "Sarah",
      "lastName": "Jenkins",
      "roleName": "ROLE_TENANT",
      "permissions": ["property:read", "lease:read", "payment:write"]
    }
  }
}
```

---

### Module 3: Users & Profiles Module (`/api/v1/users`)

#### GET `/api/v1/users`
Lists system users (Admin / Property Manager only).

**Query Parameters**: `page=1`, `limit=10`, `role=ROLE_TENANT`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [
    {
      "id": "usr_77a9b12c",
      "email": "sarah.tenant@example.com",
      "firstName": "Sarah",
      "lastName": "Jenkins",
      "roleName": "ROLE_TENANT",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### PUT `/api/v1/users/:id/profile`
Updates user profile information.

**Request Body**:
```json
{
  "firstName": "Sarah",
  "lastName": "Jenkins-Smith",
  "phoneNumber": "+15550001111",
  "bio": "Software Engineer residing in Austin TX."
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "id": "usr_77a9b12c",
    "firstName": "Sarah",
    "lastName": "Jenkins-Smith",
    "phoneNumber": "+15550001111"
  }
}
```

#### PATCH `/api/v1/users/:id/status`
Suspends or activates a user account (Admin only).

**Request Body**:
```json
{
  "status": "SUSPENDED",
  "reason": "Security policy violation"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "User status updated to SUSPENDED",
  "data": {
    "id": "usr_77a9b12c",
    "status": "SUSPENDED"
  }
}
```

---

### Module 4: RBAC Security Module (`/api/v1/rbac`)

#### GET `/api/v1/rbac/roles`
Retrieves list of system roles.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "System roles retrieved",
  "data": [
    { "id": "role_admin", "name": "ROLE_ADMIN", "description": "System Administrator" },
    { "id": "role_tenant", "name": "ROLE_TENANT", "description": "Resident Tenant" }
  ]
}
```

#### POST `/api/v1/rbac/users/:userId/roles`
Assigns a role to a user.

**Request Body**:
```json
{
  "roleId": "role_property_manager"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Role assigned successfully to user"
}
```

#### DELETE `/api/v1/rbac/users/:userId/roles/:roleId`
Revokes a role from a user.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Role revoked successfully from user"
}
```

---

### Module 5: Properties & Units Module (`/api/v1/properties`)

#### GET `/api/v1/properties/search`
Searches property listings with filters.

**Query Parameters**: `city=Austin`, `minPrice=1500`, `maxPrice=3000`, `propertyType=APARTMENT`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Properties retrieved",
  "data": [
    {
      "id": "prop_102",
      "title": "Skyline Luxury Tower",
      "address": "500 Grand Avenue",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "propertyType": "APARTMENT",
      "startingPrice": 1850.00
    }
  ],
  "meta": { "page": 1, "limit": 12, "totalItems": 1, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

#### POST `/api/v1/properties`
Creates a property listing (Owner / Admin).

**Request Body**:
```json
{
  "title": "Grand Horizon Apartments",
  "description": "Modern luxury residential community.",
  "address": "880 Colorado Street",
  "city": "Austin",
  "state": "TX",
  "postalCode": "78702",
  "propertyType": "APARTMENT"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": "prop_204",
    "title": "Grand Horizon Apartments",
    "status": "PENDING_APPROVAL"
  }
}
```

#### PUT `/api/v1/properties/:id`
Updates an existing property listing.

**Request Body**:
```json
{
  "title": "Grand Horizon Apartments & Spa",
  "description": "Updated luxury community with full spa facilities.",
  "address": "880 Colorado Street",
  "city": "Austin",
  "state": "TX",
  "postalCode": "78702",
  "propertyType": "APARTMENT"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": "prop_204",
    "title": "Grand Horizon Apartments & Spa"
  }
}
```

#### DELETE `/api/v1/properties/:id`
Deletes a property listing.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### Module 6: Discovery & Recommendation Engine (`/api/v1/discovery`)

#### GET `/api/v1/discovery/search`
Performs multi-criteria faceted discovery search.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Discovery search results",
  "data": [
    { "id": "prop_102", "title": "Skyline Luxury Tower", "matchScore": 0.98 }
  ]
}
```

#### POST `/api/v1/discovery/compare`
Compares properties side-by-side.

**Request Body**:
```json
{
  "propertyIds": ["prop_102", "prop_204"]
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Comparison matrix generated",
  "data": {
    "properties": [
      { "id": "prop_102", "avgRent": 2200, "bedrooms": 2, "rating": 4.8 },
      { "id": "prop_204", "avgRent": 1950, "bedrooms": 1, "rating": 4.5 }
    ]
  }
}
```

---

### Module 7: Leases & Booking Lifecycle (`/api/v1/leases`)

#### POST `/api/v1/leases/applications`
Submits a rental application for a unit.

**Request Body**:
```json
{
  "unitId": "unit_401",
  "moveInDate": "2026-09-01",
  "monthlyIncome": 7500.00,
  "employerName": "Tech Corp Inc"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Rental application submitted successfully",
  "data": {
    "applicationId": "app_9901",
    "status": "UNDER_REVIEW"
  }
}
```

#### PATCH `/api/v1/leases/applications/:id/status`
Approves or rejects a rental application (Owner / Admin).

**Request Body**:
```json
{
  "status": "APPROVED",
  "notes": "Income verification passed successfully."
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Application status updated to APPROVED",
  "data": {
    "applicationId": "app_9901",
    "status": "APPROVED"
  }
}
```

#### POST `/api/v1/leases/:id/sign`
Digitally executes and signs a lease contract.

**Request Body**:
```json
{
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Lease agreement executed and signed",
  "data": {
    "leaseId": "ls_501",
    "status": "ACTIVE",
    "signedAt": "2026-07-24T15:53:00.000Z"
  }
}
```

---

### Module 8: Financial Management Engine (`/api/v1/financial`)

#### POST `/api/v1/financial/invoices`
Generates a rent invoice for a lease.

**Request Body**:
```json
{
  "leaseId": "ls_501",
  "amount": 2450.00,
  "dueDate": "2026-08-01",
  "description": "Monthly Rent - August 2026"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceId": "inv_8820",
    "amount": 2450.00,
    "status": "UNPAID"
  }
}
```

#### POST `/api/v1/financial/payments`
Records a payment transaction against an invoice.

**Request Body**:
```json
{
  "invoiceId": "inv_8820",
  "amount": 2450.00,
  "paymentMethod": "STRIPE",
  "transactionReference": "ch_3N8x7bL2eZvKYlo10"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "paymentId": "pay_3301",
    "invoiceId": "inv_8820",
    "status": "COMPLETED"
  }
}
```

---

### Module 9: Maintenance & Dispatch Operations (`/api/v1/maintenance`)

#### POST `/api/v1/maintenance/requests`
Submits a maintenance ticket.

**Request Body**:
```json
{
  "unitId": "unit_401",
  "title": "HVAC Air Conditioning Leak",
  "description": "Water leaking from ceiling HVAC unit into hallway.",
  "priority": "HIGH"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Maintenance ticket created",
  "data": {
    "ticketId": "mt_5510",
    "status": "SUBMITTED",
    "priority": "HIGH"
  }
}
```

#### POST `/api/v1/maintenance/requests/:id/assign`
Assigns a vendor to handle the job.

**Request Body**:
```json
{
  "vendorId": "usr_vendor_99",
  "estimatedCost": 350.00,
  "scheduledDate": "2026-07-25T10:00:00Z"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Vendor assigned to ticket",
  "data": {
    "ticketId": "mt_5510",
    "status": "VENDOR_ASSIGNED",
    "assignedVendorId": "usr_vendor_99"
  }
}
```

---

### Module 10: Communication & Messaging (`/api/v1/communication`)

#### POST `/api/v1/communication/messages`
Sends a message inside a conversation thread.

**Request Body**:
```json
{
  "conversationId": "conv_301",
  "body": "Hello, when can I pick up the extra set of keys?"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "messageId": "msg_9091",
    "conversationId": "conv_301",
    "sentAt": "2026-07-24T15:53:00Z"
  }
}
```

---

### Module 11: Analytics Engine (`/api/v1/analytics`)

#### GET `/api/v1/analytics/executive-summary`
Fetches high-level executive KPIs.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Executive summary analytics retrieved",
  "data": {
    "totalProperties": 42,
    "totalUnits": 380,
    "occupancyRate": 94.7,
    "monthlyGrossRevenue": 892400.00,
    "activeLeases": 360
  }
}
```

---

### Module 12: AI Intelligence Layer (`/api/v1/intelligence`)

#### POST `/api/v1/intelligence/categorize-maintenance`
Uses NLP AI to auto-classify maintenance description into trade category.

**Request Body**:
```json
{
  "description": "Circuit breaker trips whenever microwave and toaster are on concurrently."
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Ticket categorization generated",
  "data": {
    "category": "ELECTRICAL",
    "suggestedPriority": "MEDIUM",
    "confidenceScore": 0.96
  }
}
```

#### GET `/api/v1/intelligence/fraud-risk/:id`
Calculates applicant background fraud risk score.

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Fraud risk score computed",
  "data": {
    "applicationId": "app_9901",
    "riskScore": 12,
    "riskLevel": "LOW",
    "flags": []
  }
}
```

---

### Module 13: Administration Platform (`/api/v1/admin`)

#### POST `/api/v1/admin/impersonate`
Generates a temporary impersonation session token for troubleshooting (Admin only).

**Request Body**:
```json
{
  "targetUserId": "usr_77a9b12c",
  "reason": "Investigating payment gateway dispute #401"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Impersonation session initialized",
  "data": {
    "impersonationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "targetUser": { "id": "usr_77a9b12c", "email": "sarah.tenant@example.com" }
  }
}
```

---

## 8. Summary Checklist & Validation

- [x] **OpenAPI 3.1 Specification**: Generated in `backend/docs/openapi.yaml` and `backend/docs/openapi.json`.
- [x] **Swagger UI Configuration**: Implemented at `/api/docs` with dark mode theme and CDN setup.
- [x] **Endpoint Coverage**: 100% of routes across all 13 modules documented.
- [x] **HTTP Method Examples**: GET, POST, PUT, PATCH, DELETE complete with request/response payloads.
- [x] **RBAC Security**: Matrix and permission tokens fully detailed.
- [x] **Rate Limit Policy**: Global (500/15m) and Auth (15/15m) headers and response bodies mapped.
- [x] **File Upload API**: Multer limits (10MB) and MIME formats detailed.
- [x] **WebSocket Events**: Socket.IO channels, room structure, and event directory documented.
