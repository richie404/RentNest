# RentNest SaaS Platform — Property Owner & Landlord User Manual

> **Target Audience**: Property Owners, Investors & Landlords  
> **Role Access Level**: `ROLE_PROPERTY_OWNER`  
> **Platform Version**: 1.0.0-PROD  

---

## 1. Introduction & Overview

The **Property Owner Portal** provides comprehensive management tools for tracking real estate portfolios, monitoring unit occupancy rates, reviewing tenant applications, tracking financial income/expenses, and managing automated monthly owner payouts.

### Login & Authentication
1. Go to `https://app.rentnest.com/owner/login`.
2. Enter your credentials and authenticate.

> ![Screenshot Placeholder: Owner Login Screen](/assets/screenshots/owner_login.png)

---

## 2. Navigation Architecture

- **Executive Portfolio (`/owner/dashboard`)**: High-level Occupancy Rate, Total Monthly Revenue Collected, Net Profit.
- **Properties & Units (`/owner/properties`)**: Portfolio inventory, media galleries, unit pricing rules.
- **Applications (`/owner/applications`)**: Review prospective tenant background screening reports.
- **Financial Ledger (`/owner/financials`)**: Revenue collection breakdowns, maintenance expenses, tax reports.
- **Owner Payouts (`/owner/payouts`)**: Automated disbursement tracking to your bank account.

> ![Screenshot Placeholder: Owner Executive Dashboard](/assets/screenshots/owner_dashboard.png)

---

## 3. Workflows & Features

### Workflow 1: Reviewing & Approving Tenant Applications
1. Navigate to **Applications (`/owner/applications`)**.
2. Click on a `SUBMITTED` application to view verified income, credit score tier, and screening reports.
3. Review background check results and references.
4. Click **Approve Application** (triggers digital lease generation) or **Decline**.

> ![Screenshot Placeholder: Application Screening Review](/assets/screenshots/owner_app_approval.png)

### Workflow 2: Monitoring Owner Payouts & Disbursements
1. Go to **Payouts (`/owner/payouts`)**.
2. View monthly calculated net payouts:
   $$\text{Net Payout} = \text{Gross Rent Collected} - \text{Management Fees (5\%)} - \text{Maintenance Expenses}$$
3. Click **Disburse Funds** to initiate an ACH transfer to your linked bank account.

> ![Screenshot Placeholder: Owner Financial Payout Ledger](/assets/screenshots/owner_payout.png)

---

## 4. Troubleshooting Guide

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| **Payout Status Pending** | Unsettled tenant payments or pending maintenance invoices | Wait for tenant ACH to settle (2-3 business days) before final distribution. |
| **Listing Showing Inactive** | Occupancy status mismatch | Verify unit status under **Properties -> Units** is set to `VACANT`. |

---

## 5. Frequently Asked Questions (FAQs)

**Q1: How are management fees calculated?**  
*A: Management fees are automatically deducted at a baseline of 5% on gross revenue collected per billing month.*

**Q2: Can I list multiple owners for a single property?**  
*A: Yes, multi-owner equity allocation is supported under **Property Settings -> Co-Ownership**.*

---

## 6. Best Practices for Property Owners
- Review tenant credit tiers carefully against local income-to-rent ratio targets (Minimum 3x monthly rent).
- Export annual financial summaries (`/owner/financials/export`) for tax filing.
