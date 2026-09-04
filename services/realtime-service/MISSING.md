# KodeDock Realtime Service — Missing Features & Improvement Roadmap

This document outlines the architectural bottlenecks, critical bugs, missing real-time capabilities, and the proposed improvement roadmap for the **Realtime WebSocket Service (Node.js)** in the **KodeDock** platform.

---

## 📊 Feature Status & Priority Matrix

| Feature | Current Status | Impact / Risk | Priority |
| :--- | :---: | :--- | :---: |
| **JWT WebSocket Authentication** | ✅ Implemented | Secure token verification on connection | - |
| **Per-IP Connection Throttling** | ✅ Implemented | Prevents single-IP connection flooding | - |
| **Heartbeat Ping/Pong (30s)** | ✅ Implemented | Cleans up zombie TCP connections | - |
| **Multi-Tab / Multi-Device Support** | ❌ **Critical Bug** | Second tab forcefully disconnects the first | 🔴 **Critical** |
| **Wallet & Payout Balance Channels** | ❌ **Missing** | No live balance sync on payments/escrow | 🔴 **High** |
| **Topic / Room Subscriptions** | ❌ **Missing** | No dispute or order-specific chat rooms | 🟡 **Medium** |
| **Global Admin Broadcast Alerts** | ❌ **Missing** | System-wide maintenance alerts dropped | 🟡 **Medium** |
| **Online/Offline Presence Tracking** | ❌ **Missing** | Cannot check if seller or staff is online | 🟢 **Low** |
| **TypeScript Protocol & Schemas** | ❌ **Missing** | Plain JS without typed event contracts | 🟢 **Low** |

---

## 🚨 1. Critical Bugs & Bottlenecks

### 1.1. Single-Connection Per-User Bug (`Map<userId, ws>`)
* **Problem:** `clients` map only allows one active WebSocket per `userId`:
  ```javascript
  const existing = clients.get(userId);
  if (existing && existing !== ws) {
    existing.close(4000, "Replaced by new connection");
  }
  clients.set(userId, ws);
  ```
  If a developer opens KodeDock in two tabs (e.g. browsing marketplace + managing seller wallet), Tab 1 is forcefully disconnected.
* **Fix Required:** Upgrade `clients` map to `Map<userId, Set<WebSocket>>` so multiple browser tabs and mobile devices receive events simultaneously.

---

## ⚡ 2. Missing Core Channels (High Priority)

### 2.1. Live Wallet & Payout Update Channels (`wallet_updates`, `payout_updates`)
* **Problem:** Currently only 3 channels are subscribed in Redis:
  ```javascript
  sub.subscribe("notifications", "order_updates", "repo_transfer");
  ```
* **Solution:**
  - Subscribe to `"wallet_updates"` and `"payout_updates"`.
  - When an order completes, escrow unlocks, or Razorpay payment succeeds, push updated `balance_paise` and `locked_escrow_paise` directly to the active user's dashboard.

---

## 💬 3. Room & Multiplexing Features (Medium Priority)

### 3.1. Topic & Room Multiplexing (`order:id`, `dispute:id`)
* **Problem:** All messages are routed exclusively by `data.userId`.
* **Solution:**
  - Support client actions: `subscribe_topic` and `unsubscribe_topic`.
  - Allow buyers and sellers to join temporary real-time rooms for order delivery communication and dispute resolution with HQ staff.

### 3.2. Global System-Wide Broadcasts
* **Problem:** Messages without a specific `userId` are ignored.
* **Solution:**
  - Add support for `channel: "broadcast"` or `type: "system_announcement"` delivered to every connected client on the platform.

---

## 🗺️ Implementation Roadmap

1. **Step 1:** Fix the multi-tab `Set<WebSocket>` bug.
2. **Step 2:** Add `wallet_updates` & `payout_updates` Redis channels.
3. **Step 3:** Implement Topic/Room multiplexing (`order:id`, `dispute:id`).
4. **Step 4:** Migrate to TypeScript (`src/index.ts`) with typed event contracts.
