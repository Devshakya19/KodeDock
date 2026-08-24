# Role-Based Access Control (RBAC) Matrix

## 1. The Paradigm Shift
Instead of a rigid, hardcoded hierarchy (`Admin -> Sub-Admin -> Staff`), KodeDock HQ utilizes a **Policy-Based Permission Model**. Roles are simply collections of granular permissions.

`User -> Role -> Permissions -> Resource -> Action -> Scope`

*Example:*
`Aman -> "Marketplace Reviewer" -> [products.read, products.approve] -> Marketplace Scope`

## 2. Core Archetypes

### A. OWNER (God Mode / Break-Glass)
- **Authority:** Absolute.
- **Capabilities:** Create/Delete Admins, Modify Commission Rates, Manage Production Secrets, Transfer Ownership, View System Audit Logs, Emergency Maintenance.
- **Rule:** The OWNER account is not for daily operations. It is a highly-secured, MFA-enforced break-glass account.

### B. ADMIN (Operational Second-in-Command)
- **Authority:** Full operational control, restricted only from Owner-exclusive settings.
- **Capabilities:** Manage Users, Products, Orders, Refunds, Support, and Staff.
- **Restrictions:** Cannot delete the Owner, cannot modify critical payment secrets, cannot wipe audit logs.

### C. SUB-ADMIN (Department Heads)
- **Authority:** Full control over a specific vertical (e.g., Finance, Marketplace, Support).
- **Example (Marketplace Sub-Admin):** Can approve/delete products and suspend sellers, but has ZERO access to view or modify financial payouts.

### D. STAFF (Granular Workers)
- **Authority:** Task-specific execution based on granular permissions.
- **Examples:**
  - `SUPPORT_STAFF`: View tickets, reply to buyers. Cannot touch payments.
  - `MODERATION_STAFF`: Approve/reject codebases. Cannot see seller earnings.
  - `FINANCE_STAFF`: Process invoices and seller withdrawals. Cannot modify marketplace catalog.

## 3. Dynamic Role Creation System
Roles will not be hardcoded in the database enum. Instead, they will be dynamically constructed in the HQ Settings panel:
- Define Role Name (e.g., `Fraud Analyst`)
- Toggle Permissions (`users.view`, `payments.hold`, `orders.view`)
- Assign Role to Team Member
