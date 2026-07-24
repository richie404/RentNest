# RentNest SaaS Platform — System Administrator User Manual

> **Target Audience**: Platform Administrators & System Operations  
> **Role Access Level**: `ROLE_ADMIN`  
> **Platform Version**: 1.0.0-PROD  

---

## 1. Introduction & Security Safeguards

The **Admin Portal** provides platform-wide operational control, RBAC permission assignment, audit logging inspection, user status management, system setting updates, and platform metric analytics.

### Superuser Authentication
1. Go to `https://app.rentnest.com/admin/login`.
2. Hardware MFA token or 6-digit TOTP verification is mandatory.

> ![Screenshot Placeholder: Admin MFA Login](/assets/screenshots/admin_login.png)

---

## 2. Navigation Architecture

- **System Dashboard (`/admin/dashboard`)**: Live active user counts, API request rates, system uptime.
- **User Management (`/admin/users`)**: User accounts, status toggles (`ACTIVE`, `SUSPENDED`), password resets.
- **RBAC Governance (`/admin/rbac`)**: Roles, permissions, dynamic assignment matrix.
- **Audit Logs (`/admin/audit-logs`)**: Complete historical audit trail with JSON pre/post snapshots.
- **Platform Settings (`/admin/settings`)**: Global fees, currency list, storage quotas.

---

## 3. Workflows & Features

### Workflow 1: Dynamic RBAC Role & Permission Assignment
1. Navigate to **RBAC Governance (`/admin/rbac`)**.
2. Select a target user or role (`ROLE_PROPERTY_MANAGER`).
3. Check/uncheck specific permission codes (e.g. `financial:payout_disburse`, `leases:override_approval`).
4. Click **Save RBAC Matrix**. Changes take effect immediately across all cluster instances via Redis.

> ![Screenshot Placeholder: Admin RBAC Matrix Interface](/assets/screenshots/admin_rbac.png)

### Workflow 2: Investigating Audit Logs
1. Go to **Audit Logs (`/admin/audit-logs`)**.
2. Filter by `Actor ID`, `Action Type` (`UPDATE`, `DELETE`), or `Target Table`.
3. Expand a log entry to view exact pre-image and post-image JSON comparisons.

> ![Screenshot Placeholder: Audit Log Inspection Table](/assets/screenshots/admin_audit.png)

---

## 4. Best Practices for Admins
- Never share administrative credentials; enforce TOTP MFA for all `ROLE_ADMIN` users.
- Regularly review the **Security Audit Dashboard** (`/api/v1/admin/security-dashboard`) for elevated permission changes.
