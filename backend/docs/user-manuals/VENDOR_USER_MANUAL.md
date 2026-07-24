# RentNest SaaS Platform — Maintenance Vendor User Manual

> **Target Audience**: Service Contractors, Mechanics, Electricians & Vendors  
> **Role Access Level**: `ROLE_VENDOR`  
> **Platform Version**: 1.0.0-PROD  

---

## 1. Introduction & Account Setup

The **Vendor Portal** streamlines maintenance work order assignments, dispatch scheduling, ticket status updates, expense logging (parts & labor), and invoice reimbursement.

### Login & Access
1. Visit `https://app.rentnest.com/vendor/login`.
2. Log in using your verified contractor credentials.

> ![Screenshot Placeholder: Vendor Portal Login](/assets/screenshots/vendor_login.png)

---

## 2. Navigation Architecture

- **Dispatch Queue (`/vendor/work-orders`)**: List of open maintenance requests assigned to your firm.
- **Active Jobs (`/vendor/jobs/active`)**: Work orders currently `IN_PROGRESS`.
- **Expense Logging (`/vendor/expenses`)**: Submit labor hours, parts invoices, and repair receipts.
- **Certifications (`/vendor/profile`)**: Manage trade licenses, insurance policies, and certifications.

---

## 3. Workflows & Features

### Workflow 1: Fulfilling & Updating Maintenance Tickets
1. Go to **Work Orders (`/vendor/work-orders`)**.
2. Click on a ticket marked `ASSIGNED`. Review the unit location, tenant description, and entry permissions.
3. Update status to `IN_PROGRESS` when on-site.
4. Once completed, take photo proof of repair, write a work summary note, and change status to `COMPLETED`.

> ![Screenshot Placeholder: Vendor Work Order Update Screen](/assets/screenshots/vendor_work_order.png)

### Workflow 2: Submitting Labor & Parts Expenses
1. Under **Expense Logging (`/vendor/expenses`)**, click **Log Expense**.
2. Select the target Work Order ID.
3. Enter `Labor Cost` + `Parts Cost` (Total cost calculates automatically).
4. Attach a scan of your material receipts and click **Submit Expense Invoice**.

> ![Screenshot Placeholder: Expense Invoice Logging](/assets/screenshots/vendor_expense.png)

---

## 4. Troubleshooting & Best Practices

- **Expired Insurance Alert**: If your liability insurance expires, job dispatch will be temporarily paused until an updated certificate is uploaded under **Profile -> Certifications**.
- **Tenant Communication**: Use in-app messaging to notify tenants 24 hours prior to entering the unit.
