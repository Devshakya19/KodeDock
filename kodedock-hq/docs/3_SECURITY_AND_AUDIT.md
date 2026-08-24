# Security, Audit Logs, and Workflows

## 1. Immutable Audit Logging
The most critical security feature of KodeDock HQ is the Immutable Audit Log. Every action taken by any staff member is permanently recorded in the database.

**Tracked Metrics (The 5 Ws):**
- **WHO:** Which staff member/admin executed the action?
- **WHAT:** What action was taken? (e.g., `Product Suspended`, `Withdrawal Approved`)
- **WHERE:** Which resource was affected? (e.g., `Order ORD-123`, `User USR-999`)
- **WHEN:** Precise UTC timestamp.
- **WHY:** Mandatory reason field for destructive actions.
- **HOW:** IP Address and User-Agent logging.

*Example Audit Record:*
`[2026-08-23 22:41] Admin 'Rahul' [IP: 192.168.1.1] executed 'Product Suspended' on 'Next.js SaaS Kit'. Reason: Policy Violation. Status: SUCCESS.`

## 2. Sensitive Action Approvals (Maker-Checker Workflow)
Destructive or high-risk financial actions cannot be executed directly by base-level staff. They must traverse an approval chain.

**High-Risk Triggers:**
- Large Refunds (> $500)
- Seller Suspensions
- Product Takedowns (High Grossing Products)

**Approval Pipeline Example:**
`STAFF (Requests Refund) -> SYSTEM (Flags as High Risk) -> ADMIN (Reviews & Approves) -> SYSTEM (Executes)`

## 3. Recommended Security Upgrades (For Future)
- **MFA Enforcement:** Mandatory 2-Factor Authentication via Authenticator App for any account logging into `kodedock-hq`.
- **IP Whitelisting:** Restrict HQ access to specific corporate IP addresses or VPN subnets.
- **Session Lifetimes:** Aggressive session timeouts (e.g., 30 minutes of inactivity forces re-authentication).
