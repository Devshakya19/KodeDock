# KodeDock HQ - System Architecture Blueprint

## 1. Core Philosophy
**KodeDock Marketplace is the engine. KodeDock HQ is the Control Plane.**

HQ is an isolated, internal operating system designed for managing the entire lifecycle of the KodeDock marketplace. It is strictly separated from the customer-facing `web` application to guarantee zero layout leakage, isolated authentication states, and heightened security.

## 2. Infrastructure
- **Frontend Framework:** Vite + React + TypeScript (Single Page Application)
- **UI Architecture:** Tailwind CSS v4 + Shadcn UI
- **Backend Connection:** Direct secure API connection to `core-engine` (Rust) via dedicated `/api/hq/*` routes.
- **Authentication:** JWT-based stateless authentication with strict multi-factor authentication (MFA) requirements for high-level roles.

## 3. High-Level Modules (The Dynamic Sidebar)
The UI dynamically renders modules based strictly on the authenticated user's permission matrix.

1. **OVERVIEW:** Dashboard, Real-time Analytics
2. **MARKETPLACE:** Products, Categories, Sellers, Buyers
3. **ORDERS:** Deliveries, Refunds, Disputes
4. **FINANCE:** Transactions, Withdrawals, Invoices, Commissions
5. **TRUST & SAFETY:** Reports, Moderation, Risk Analysis
6. **SUPPORT:** Tickets, User Conversations
7. **TEAM (Super Admin Only):** Admins, Sub-Admins, Staff, Roles & Permissions
8. **SYSTEM:** Audit Logs, Integrations, Settings
