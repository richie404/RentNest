# RentNest SaaS Platform — Resident Tenant User Manual

> **Target Audience**: Resident Tenants & Applicants  
> **Role Access Level**: `ROLE_TENANT`  
> **Platform Version**: 1.0.0-PROD  

---

## 1. Introduction & Account Registration

Welcome to RentNest! The Tenant Portal allows you to browse vacant properties, submit digital rental applications, sign digital lease agreements, pay monthly rent via ACH or Credit Card, submit maintenance requests, and message your property manager.

### Account Registration & Login
1. Navigate to `https://app.rentnest.com/login`.
2. Enter your registered **Email Address** and **Password**.
3. Click **Sign In**. (If Two-Factor Authentication is enabled, enter your 6-digit authenticator code).

> ![Screenshot Placeholder: Tenant Login Interface](/assets/screenshots/tenant_login.png)

---

## 2. Portal Navigation Guide

- **Dashboard (`/tenant/dashboard`)**: Overview of active lease, upcoming rent due dates, and open maintenance tickets.
- **My Lease (`/tenant/lease`)**: Access your digital lease agreement, terms, and renewal options.
- **Payments (`/tenant/payments`)**: View invoices, payment history, and set up Auto-Pay.
- **Maintenance (`/tenant/maintenance`)**: Log repair requests, upload photos, and track vendor progress.
- **Messages (`/tenant/messages`)**: Direct messaging channel with your property manager.

> ![Screenshot Placeholder: Tenant Dashboard Navigation](/assets/screenshots/tenant_dashboard.png)

---

## 3. Core Features & Step-by-Step Workflows

### Workflow 1: Submitting a Rental Application
1. Search for available units on the **Property Discovery** page (`/search`).
2. Select your desired unit and click **Apply Now**.
3. Fill out employer details, monthly income, pet declarations, and reference contacts.
4. Upload proof of income (paystubs / bank statements) and submit the application fee.
5. Track status under **My Applications** (`SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED`).

> ![Screenshot Placeholder: Rental Application Form](/assets/screenshots/tenant_application.png)

### Workflow 2: Paying Monthly Rent & Auto-Pay Setup
1. Go to **Payments (`/tenant/payments`)**.
2. Select an unpaid invoice and click **Pay Invoice**.
3. Choose your payment method (**ACH Bank Transfer** or **Credit Card**).
4. Review total amount including utility or parking line items and click **Submit Payment**.
5. Toggle **Enable Auto-Pay** to automatically process rent on the 1st of every month.

> ![Screenshot Placeholder: Payment Gateway & Invoice Line Items](/assets/screenshots/tenant_payment.png)

### Workflow 3: Submitting a Maintenance Ticket
1. Go to **Maintenance (`/tenant/maintenance`)** and click **New Request**.
2. Select the issue category (e.g. *Plumbing*, *Electrical*, *HVAC*).
3. Set the priority level (*LOW*, *MEDIUM*, *HIGH*, *EMERGENCY*).
4. Provide a detailed description and attach photos of the issue.
5. Toggle **Permission to Enter** if technicians can enter when you are absent.
6. Click **Submit Ticket**. You will receive real-time notifications when a vendor is dispatched.

> ![Screenshot Placeholder: Maintenance Request Form](/assets/screenshots/tenant_maintenance.png)

---

## 4. Troubleshooting Guide

| Issue / Symptom | Possible Cause | Recommended Resolution |
| :--- | :--- | :--- |
| **Login Failed / Invalid Token** | Expired session or incorrect password | Click **Forgot Password** or clear browser cookies and log in again. |
| **Payment Declined** | Insufficient funds or card restriction | Verify bank balance or call your card issuer; retry with ACH transfer. |
| **Cannot Upload Paystub File** | File size exceeds 10MB limit | Compress PDF or convert image to JPEG format (< 10MB). |

---

## 5. Frequently Asked Questions (FAQs)

**Q1: How do I renew my lease agreement?**  
*A: When your lease is within 60 days of expiration, a **Lease Renewal Offer** banner will appear on your Dashboard. Review the offered rent and click **Accept Renewal**.*

**Q2: Who do I contact for emergency maintenance after hours?**  
*A: For life-threatening emergencies, call 911. For urgent property emergencies (e.g. major water leak, heat outage in winter), submit a ticket with priority set to **EMERGENCY** and call the 24/7 hotline at 1-800-555-NEST.*

---

## 6. Best Practices for Tenants
- Enable **Auto-Pay** at least 3 days before the due date to avoid late fee penalties.
- Take move-in photos and attach them during your initial **Move-In Inspection**.
- Always update your **Emergency Contact Information** under **Profile Settings**.
