# RentNest SaaS Platform — Customer Support Staff User Manual

> **Target Audience**: Helpdesk Agents, Customer Success & Support Staff  
> **Role Access Level**: `ROLE_PROPERTY_MANAGER` / Support Tier  
> **Platform Version**: 1.0.0-PROD  

---

## 1. Introduction & Overview

The **Support Staff Portal** provides customer support agents with tools to assist tenants, property owners, and vendors. It includes ticket escalation, account verification help, manual notification dispatch, and issue resolution workflows.

---

## 2. Navigation Architecture

- **Support Desk (`/support/tickets`)**: Inbound support tickets and inquiry threads.
- **User Lookup (`/support/users`)**: Search user profiles, active leases, and payment status.
- **Broadcast Alerts (`/support/notifications`)**: Send targeted push notifications or email alerts to residents.

---

## 3. Workflows & Features

### Workflow 1: Assisting a Tenant with Password Reset or Verification
1. Search tenant email in **User Lookup (`/support/users`)**.
2. Verify tenant identity via phone challenge (birthdate or last 4 digits of SSN hash).
3. Click **Send Password Reset Link** or **Re-send Email Verification**.

> ![Screenshot Placeholder: Support User Lookup Screen](/assets/screenshots/support_user_lookup.png)

### Workflow 2: Escalating Maintenance Disputes
1. Open the maintenance ticket in **Support Desk (`/support/tickets`)**.
2. Review vendor update notes and tenant feedback comments.
3. Re-assign ticket priority to `EMERGENCY` or notify property manager via internal notes.

> ![Screenshot Placeholder: Ticket Escalation Interface](/assets/screenshots/support_escalation.png)

---

## 4. Best Practices for Support Staff
- Always record support ticket reference numbers in communication notes.
- Do not attempt to modify billing ledger amounts directly; escalate financial discrepancies to `ROLE_FINANCE_OFFICER`.
