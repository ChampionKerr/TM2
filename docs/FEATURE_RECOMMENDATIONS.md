# TimeWise HRMS - Recommended Features & Enhancements Roadmap

This document outlines feature recommendations to expand **TimeWise HRMS** into an enterprise-ready Human Resource Management System.

---

## 📋 Table of Contents

1. [Feature Priority & Complexity Matrix](#-feature-priority--complexity-matrix)
2. [Phase 1: Advanced Leave Policies & Flexibilities](#-phase-1-advanced-leave-policies--flexibilities)
3. [Phase 2: Integrations & Real-Time Communication](#-phase-2-integrations--real-time-communication)
4. [Phase 3: Multi-Level Approvals & Organizational Structure](#-phase-3-multi-level-approvals--organizational-structure)
5. [Phase 4: Time, Attendance & Overtime](#-phase-4-time-attendance--overtime)
6. [Phase 5: Reporting, Security & Enterprise Auditing](#-phase-5-reporting-security--enterprise-auditing)

---

## 📊 Feature Priority & Complexity Matrix

| Feature | Category | Business Value | Implementation Complexity |
| :--- | :--- | :--- | :--- |
| **Half-Day & Hourly Leave** | Leave Management | High | Medium |
| **Public Holiday Calendar** | Leave Management | High | Low |
| **Medical Attachment Uploads** | Leave Management | High | Low - Medium |
| **Slack / Teams Bot Integrations** | Communication | High | Medium - High |
| **Calendar Feed (iCal export)** | Integrations | Medium | Low |
| **Multi-Level Approval Chains** | Organizational | High | High |
| **Interactive Org Chart** | Organizational | Medium | Medium |
| **Clock-In / Clock-Out & Timesheets** | Attendance | High | High |
| **Payroll CSV/PDF Export** | Reporting | High | Low - Medium |
| **Audit Logs & 2FA** | Security | High | Medium |

---

## 📅 Phase 1: Advanced Leave Policies & Flexibilities

### 1. Half-Day & Hourly Leave Support
* **Description:** Allow employees to submit leave requests for partial days (Morning / Afternoon sessions or specified hours).
* **Key Enhancements:**
  * Update `LeaveRequest` Prisma model to support duration units (`FULL_DAY`, `HALF_DAY_AM`, `HALF_DAY_PM`, `HOURLY`).
  * Recalculate vacation/sick day subtractions based on half-day (0.5) or hourly fractional deductions.

### 2. Custom Leave Policies & Accruals
* **Description:** Support for additional leave categories and automated accrual rules.
* **Key Enhancements:**
  * Support categories: Maternity/Paternity, Bereavement, Work-From-Home (WFH), Compensatory Off.
  * Accrual engine: Automatically add fractional days (e.g., +1.66 days/month) and handle annual carry-over caps.

### 3. Public Holiday Calendar Integration
* **Description:** Region/country-aware holiday calendar to automatically exclude public holidays and weekends from requested leave days.
* **Key Enhancements:**
  * Admin interface to manage company and regional holiday schedules.
  * Automatic exclusion when computing `daysRequested`.

### 4. Medical Certificate Attachment Uploads
* **Description:** Allow employees to attach medical notes/certificates for sick leaves exceeding 2 consecutive days.
* **Key Enhancements:**
  * Supabase Storage / S3 file upload integration.
  * Secure view permissions for managers and HR admins only.

---

## 🔔 Phase 2: Integrations & Real-Time Communication

### 1. Slack & Microsoft Teams Webhooks / Bot
* **Description:** Real-time notifications and interactive actions in team messaging apps.
* **Key Enhancements:**
  * Instant Slack/Teams alert when a direct report submits a leave request.
  * Interactive **Approve** and **Reject** buttons directly inside Slack messages.
  * Daily automated channel digest (e.g., *"Out of Office Today"* summary).

### 2. Live Calendar Feed Export (iCal / Google Calendar / Outlook)
* **Description:** Subscribe to live team leave feeds from external calendar apps.
* **Key Enhancements:**
  * Secure token-authenticated `.ics` endpoint (e.g., `/api/calendar/feed?token=xyz`).
  * Per-department or per-team calendar synchronization.

---

## 👥 Phase 3: Multi-Level Approvals & Organizational Structure

### 1. Multi-Tier Approval Workflows
* **Description:** Route leave requests through line managers before reaching HR administration.
* **Key Enhancements:**
  * Manager assignment per user in database schema (`managerId` relation on `User`).
  * Multi-step approval statuses (`Pending_Manager`, `Pending_HR`, `Approved`, `Rejected`).

### 2. Approval Delegation
* **Description:** Enable managers to delegate approval authority to a designated peer while away on leave.

### 3. Interactive Organization Chart
* **Description:** Visual company directory displaying reporting lines, team structures, and current availability status.

---

## ⏰ Phase 4: Time, Attendance & Overtime

### 1. Digital Clock-In / Clock-Out & Timesheets
* **Description:** Daily time tracking for remote and hybrid teams.
* **Key Enhancements:**
  * Simple dashboard button for clocking in/out and logging break times.
  * Weekly timesheet generation and approval workflow.

### 2. Overtime & Compensatory Off (Comp-Off)
* **Description:** Track overtime hours worked and convert approved extra hours into Comp-Off leave days.

---

## 🔒 Phase 5: Reporting, Security & Enterprise Auditing

### 1. One-Click Payroll & Attendance Export
* **Description:** Export structured attendance and leave data for external payroll processing.
* **Key Enhancements:**
  * Export options: CSV, Excel (`.xlsx`), and formatted PDF summaries.
  * Date range and department filtering.

### 2. Comprehensive System Audit Logging
* **Description:** Immutable security and compliance log tracking all balance changes, administrative actions, and approval histories.

### 3. Two-Factor Authentication (2FA / MFA)
* **Description:** Support TOTP authenticator apps (Google Authenticator, Authy) for admin and employee sign-in verification.
