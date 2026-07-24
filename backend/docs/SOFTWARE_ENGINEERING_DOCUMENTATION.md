# RentNest SaaS Platform — Enterprise Software Engineering Documentation

> **Document Type**: Enterprise Software Architecture & System Design Document (SAD/HLD/LLD)  
> **System Architecture**: Modular Monolith (Layered Architecture: Controller-Service-Repository)  
> **Backend Technologies**: Node.js 20+ LTS / Express 4.x / TypeScript 5.7 / MySQL 8.0 / Socket.IO / Redis  
> **Target Audience**: Enterprise Software Architects, Principal Engineers, DBA & DevOps Engineers  
> **Document Version**: 1.0.0-ENTERPRISE  

---

## Executive Architectural Summary

The **RentNest SaaS Platform** is an enterprise-grade multi-tenant real estate and property management ecosystem. The backend is designed as a **High-Throughput Modular Monolith** operating on a clean **Controller-Service-Repository (CSR)** layered architecture. It cleanly separates HTTP routing, input validation (Zod schemas), domain logic execution, and database persistence (MySQL 8 Stored Procedures & Repositories).

---

## 1. Software Architecture Document (SAD)

### Architectural Goals & Design Principles
1. **Strict Separation of Concerns**: Decouples presentation/API layers from core business rules and database data access.
2. **Type Safety Across Layers**: End-to-end TypeScript interfaces shared between requests, DTOs, domain models, and API responses.
3. **Stateless Scale-Out**: Authentication relies on dual JWT tokens (Access + Refresh) and centralized Redis session invalidation, enabling zero-stickiness PM2 cluster scaling.
4. **Strict Auditability**: Automated database triggers and middleware audit trails record all administrative overrides and critical domain updates.

---

## 2. High-Level Design (HLD) & System Overview

The system consists of 13 core business sub-domains:

```
[ Client Applications ] ---> [ Cloudflare WAF ] ---> [ Nginx Reverse Proxy ]
                                                            |
                                                            v
                                                  [ Express API Gateway ]
                                                            |
     +-------------------+-------------------+--------------+--------------+-------------------+
     |                   |                   |                             |                   |
[ Auth Module ]   [ Property Module ] [ Lease Module ]           [ Financial Module ] [ Maintenance Module ]
     |                   |                   |                             |                   |
     +-------------------+-------------------+--------------+--------------+-------------------+
                                                            |
                                                 [ Stored Procedures ]
                                                            |
                                                   [ MySQL 8 Engine ]
```

---

## 3. Low-Level Design (LLD) & Pattern Standards

Each module follows a uniform directory structure and dependency injection model:

- `*.routes.ts`: Defines REST endpoint routes, HTTP verbs, and mounts authentication (`authenticateToken`) and authorization (`authorizeRoles`) middlewares.
- `*.controller.ts`: Handles Express `Request` and `Response`, parses query/params, delegates work to services, and formats standard envelopes via `ApiResponse`.
- `*.service.ts`: Implements business transactions, validations, stored procedure calls, and domain rules.
- `*.repository.ts`: Encapsulates raw SQL queries or DB pool procedures using `mysql2/promise`.

---

## 4. Component Diagram

```mermaid
graph TD
    Client["Client Web / Mobile App"] -->|HTTPS / WSS| Nginx["Nginx Reverse Proxy"]
    Nginx -->|Proxy Pass| Express["Express API Gateway (app.ts)"]
    
    subgraph Middleware Stack
        Express --> Helmet["Helmet & CORS"]
        Helmet --> RateLimiter["Rate Limiter"]
        RateLimiter --> AuthMiddleware["JWT Auth Guard"]
        AuthMiddleware --> RBACGuard["RBAC Role Guard"]
    end
    
    RBACGuard --> Controllers["Module Controllers"]
    
    subgraph Domain Business Layer
        Controllers --> AuthSvc["Auth Service"]
        Controllers --> PropSvc["Property Service"]
        Controllers --> LeaseSvc["Lease Service"]
        Controllers --> FinSvc["Financial Service"]
        Controllers --> MaintSvc["Maintenance Service"]
    end
    
    subgraph Data Access & Persistence Layer
        AuthSvc --> DBPool["mysql2 Connection Pool"]
        PropSvc --> DBPool
        LeaseSvc --> DBPool
        FinSvc --> DBPool
        MaintSvc --> DBPool
        
        DBPool --> MySQL[("MySQL 8.0 Primary DB")]
        AuthSvc --> Redis[("Redis Cache & Sessions")]
    end
```

---

## 5. Deployment Diagram

```mermaid
graph TB
    subgraph External Clients
        Desktop["Browser / Web App"]
        Mobile["Mobile Native App"]
    end

    subgraph Security Edge
        WAF["Cloudflare DNS & WAF"]
    end

    subgraph App Server Infrastructure (Ubuntu 22.04 LTS)
        Nginx["Nginx (SSL Termination TLS 1.3)"]
        
        subgraph PM2 Cluster Host
            Worker1["Express Node Worker 1"]
            Worker2["Express Node Worker 2"]
            WorkerN["Express Node Worker N"]
        end
    end

    subgraph Data Infrastructure Tier
        RedisCluster[("Redis Enterprise Cluster")]
        DBPrimary[("MySQL 8 Primary Writer")]
        DBReplica[("MySQL 8 Read Replica")]
    end

    Desktop --> WAF
    Mobile --> WAF
    WAF --> Nginx
    Nginx --> Worker1
    Nginx --> Worker2
    Nginx --> WorkerN
    
    Worker1 --> RedisCluster
    Worker2 --> RedisCluster
    WorkerN --> RedisCluster
    
    Worker1 --> DBPrimary
    Worker2 --> DBPrimary
    WorkerN --> DBPrimary
    
    DBPrimary -->|GTID Replication| DBReplica
```

---

## 6. Sequence Diagrams

### 6.1 Authentication & Dual JWT Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client App
    participant Middleware as Auth Router
    participant Service as AuthService
    participant DB as MySQL DB
    participant Redis as Redis Cache

    User->>Middleware: POST /api/v1/auth/login { email, password }
    Middleware->>Service: login(email, password)
    Service->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Service: User Record (password_hash)
    Service->>Service: Verify bcrypt password hash
    
    alt Password Invalid
        Service-->>Middleware: Throw UnauthorizedError
        Middleware-->>User: 401 Unauthorized Envelope
    else Password Valid
        Service->>Service: Generate Access Token (15m) & Refresh Token (7d)
        Service->>Redis: Store Refresh Token Key (user_id)
        Service-->>Middleware: Return Tokens & User DTO
        Middleware-->>User: 200 OK Envelope + Set HTTP-Only Cookie
    end
```

### 6.2 Lease Application & Invoice Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Resident Tenant
    participant API as Lease Controller
    participant Service as Lease Service
    participant DB as MySQL Database

    Tenant->>API: POST /api/v1/leases/applications
    API->>Service: createApplication(unitId, tenantId, details)
    Service->>DB: INSERT INTO rental_applications ...
    DB-->>Service: application_id = 50
    Service-->>Tenant: 201 Application Submitted

    actor Owner as Property Owner
    Owner->>API: PATCH /api/v1/leases/applications/50/status { status: 'APPROVED' }
    API->>Service: approveApplication(appId)
    Service->>DB: START TRANSACTION
    Service->>DB: UPDATE rental_applications SET status = 'APPROVED'
    Service->>DB: INSERT INTO leases (unit_id, status = 'ACTIVE')
    Service->>DB: CALL sp_GenerateLeaseInvoice(lease_id, ...)
    Service->>DB: COMMIT TRANSACTION
    DB-->>Owner: 200 OK Lease Activated & Invoice Created
```

---

## 7. Class Diagrams

```mermaid
classDiagram
    class User {
        +BIGINT user_id
        +String email
        +String password_hash
        +String account_status
        +register()
        +login()
    }

    class UserProfile {
        +BIGINT profile_id
        +String first_name
        +String last_name
        +Date date_of_birth
        +String avatar_url
    }

    class Property {
        +BIGINT property_id
        +BIGINT owner_id
        +String property_name
        +String property_type
        +String city
        +createProperty()
    }

    class Unit {
        +BIGINT unit_id
        +BIGINT property_id
        +String unit_number
        +Decimal target_rent
        +String status
        +updateStatus()
    }

    class Lease {
        +BIGINT lease_id
        +BIGINT unit_id
        +Date start_date
        +Date end_date
        +Decimal monthly_base_rent
        +String status
        +activateLease()
    }

    class LeaseInvoice {
        +BIGINT invoice_id
        +BIGINT lease_id
        +Date due_date
        +Decimal total_amount_due
        +String payment_status
    }

    User "1" -- "1" UserProfile : has
    User "1" -- "0..*" Property : owns
    Property "1" -- "1..*" Unit : contains
    Unit "1" -- "0..*" Lease : bound_to
    Lease "1" -- "0..*" LeaseInvoice : generates
```

---

## 8. Package Diagram

```mermaid
graph TD
    subgraph Root Application Namespace
        App["app.ts (Express Application Setup)"]
        Server["server.ts (HTTP & Socket.IO Listener)"]
    end

    subgraph Shared Configuration Namespace ["src/config"]
        Env["env.config.ts"]
        DBConfig["database.config.ts"]
        CORSConfig["cors.config.ts"]
    end

    subgraph Security & Middleware Namespace ["src/middleware"]
        AuthMw["auth.middleware.ts"]
        RBACMw["rbac.middleware.ts"]
        RateMw["rate-limiter.middleware.ts"]
        ErrorMw["error.middleware.ts"]
    end

    subgraph Business Domain Modules Namespace ["src/modules"]
        AuthMod["modules/auth"]
        UserMod["modules/users"]
        PropMod["modules/properties"]
        LeaseMod["modules/leases"]
        FinMod["modules/financial"]
        MaintMod["modules/maintenance"]
        AdminMod["modules/admin"]
    end

    subgraph Persistence Namespace ["src/repositories"]
        UserRepo["user.repository.ts"]
        PropRepo["property.repository.ts"]
        LeaseRepo["lease.repository.ts"]
    end

    App --> Shared Configuration Namespace
    App --> Security & Middleware Namespace
    App --> Business Domain Modules Namespace
    Business Domain Modules Namespace --> Persistence Namespace
```

---

## 9. Activity Diagram (Lease Execution & Approval Workflow)

```mermaid
stateDiagram-v2
    [*] --> ApplicationSubmitted: Tenant submits application
    ApplicationSubmitted --> UnderReview: Screening & Credit Check Triggered
    
    state Decision <<choice>>
    UnderReview --> Decision: Owner Evaluates Application
    
    Decision --> Rejected: Income/Credit Below Threshold
    Decision --> Approved: Application Approved
    
    Rejected --> [*]: Notification Sent to Applicant
    
    Approved --> DraftLeaseCreated: Generate Digital Lease Contract
    DraftLeaseCreated --> PendingSignature: Awaiting Signatures
    
    PendingSignature --> LeaseActive: Tenant & Owner Sign Contract
    LeaseActive --> InitialInvoiceGenerated: Trigger sp_GenerateLeaseInvoice
    InitialInvoiceGenerated --> [*]: Rent Payment Schedule Started
```

---

## 10. State Diagrams (Lease Lifecycle State Machine)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Lease Created by Property Manager
    DRAFT --> PENDING_SIGNATURE: Clauses Added & Sent to Tenant
    
    PENDING_SIGNATURE --> ACTIVE: All Signers Complete Digital Signature
    PENDING_SIGNATURE --> TERMINATED: Signing Deadline Expired / Cancelled
    
    ACTIVE --> EXPIRED: End Date Reached (No Renewal)
    ACTIVE --> TERMINATED: Early Termination Agreed / Eviction
    
    EXPIRED --> [*]
    TERMINATED --> [*]
```

---

## 11. Use Case Diagram

```mermaid
graph LR
    Tenant(("Resident Tenant"))
    Owner(("Property Owner"))
    Vendor(("Maintenance Vendor"))
    Admin(("System Admin"))

    subgraph RentNest Use Cases
        UC1("Browse & Filter Vacant Properties")
        UC2("Submit Rental Application")
        UC3("Pay Monthly Lease Invoice")
        UC4("Submit Maintenance Request")
        UC5("Review & Approve Applications")
        UC6("Disburse Owner Payouts")
        UC7("Fulfill Maintenance Work Orders")
        UC8("Manage RBAC Roles & System Audit Logs")
    end

    Tenant --> UC1
    Tenant --> UC2
    Tenant --> UC3
    Tenant --> UC4

    Owner --> UC5
    Owner --> UC6

    Vendor --> UC7

    Admin --> UC8
```

---

## 12. API Interaction Diagram

```mermaid
graph TD
    API["Client HTTP Endpoint"] --> Router["Express Master Router (/api/v1)"]
    
    Router --> AuthRoute["POST /api/v1/auth/login"]
    Router --> PropRoute["GET /api/v1/properties"]
    Router --> LeaseRoute["POST /api/v1/leases/applications"]
    Router --> FinRoute["POST /api/v1/financial/payments"]
    
    AuthRoute --> AuthCtrl["AuthController.login()"]
    PropRoute --> PropCtrl["PropertyController.getProperties()"]
    LeaseRoute --> LeaseCtrl["LeaseController.createApplication()"]
    FinRoute --> FinCtrl["FinancialController.processPayment()"]
    
    AuthCtrl --> AuthSvc["AuthService"]
    PropCtrl --> PropSvc["PropertyService"]
    LeaseCtrl --> LeaseSvc["LeaseService"]
    FinCtrl --> FinSvc["FinancialService"]
    
    FinSvc --> SP1["CALL sp_ProcessPaymentAllocation"]
    LeaseSvc --> SP2["CALL sp_GenerateLeaseInvoice"]
```

---

## 13. Entity-Relationship Database Diagram

```mermaid
erDiagram
    users ||--o| user_profiles : "has profile"
    users ||--o{ user_roles : "assigned"
    roles ||--o{ user_roles : "defines"
    users ||--o{ properties : "owns"
    properties ||--o{ units : "contains"
    units ||--o{ leases : "bound to"
    leases ||--o{ lease_invoices : "generates"
    lease_invoices ||--o{ invoice_items : "contains"
    units ||--o{ maintenance_requests : "reported for"
    vendors ||--o{ maintenance_requests : "assigned to"
    users ||--o{ audit_logs : "performed by"

    users {
        bigint user_id PK
        string email
        string password_hash
        string account_status
    }

    properties {
        bigint property_id PK
        bigint owner_id FK
        string property_name
        string city
    }

    units {
        bigint unit_id PK
        bigint property_id FK
        string unit_number
        decimal target_rent
        string status
    }

    leases {
        bigint lease_id PK
        bigint unit_id FK
        date start_date
        date end_date
        decimal monthly_base_rent
        string status
    }

    lease_invoices {
        bigint invoice_id PK
        bigint lease_id FK
        date due_date
        decimal total_amount_due
        string payment_status
    }
```
