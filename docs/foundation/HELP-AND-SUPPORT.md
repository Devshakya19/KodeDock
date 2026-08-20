# KodeDock — Help & Support

> Everything you need to get help on KodeDock.

---

**Last Updated:** August 2, 2026

---

## 1. Quick Help

### I'm a Buyer

| Question | Answer |
|----------|--------|
| **How do I purchase a product?** | Browse → Click product → "Buy Now" → Pay via wallet or Razorpay → Code delivered to GitHub |
| **Where is my code delivered?** | As a **private repository** in your GitHub account |
| **How do I top up my wallet?** | Dashboard → Wallet → "Add Money" → Pay via Razorpay |
| **Can I get a refund?** | Yes, within 7 days if the product is non-functional or misdescribed. See [Refund Policy](03-REFUND-POLICY.md) |
| **How do I leave a review?** | Go to your purchase → "Write Review" (only for verified purchases) |
| **My payment failed but money was deducted** | Don't worry — Razorpay auto-refunds within 5–7 business days. If not, email support@kodedock.com |

### I'm a Seller

| Question | Answer |
|----------|--------|
| **How do I list a product?** | Seller Dashboard → "List Product" → Fill details + upload image + add GitHub repo URL |
| **When do I get paid?** | Earnings are held in **escrow for 7 days**, then released to your available balance |
| **How do I withdraw earnings?** | Seller Wallet → Add payout method (bank/UPI) → "Withdraw" (min ₹500) |
| **What's the platform fee?** | **2.5%** — you keep **97.5%** of every sale |
| **Minimum product price?** | **₹49** (4,900 paise) |
| **How are sales counted?** | Automatically via database triggers when an order completes |

---

## 2. Getting Started Guides

### 2.1 Buyer Guide

```
Step 1: Create account
   └── Go to /register → Enter email, password, name
   └── Verify email (if required)

Step 2: Browse products
   └── /browse → Search by name, filter by category
   └── Or /category/[slug] for specific categories
   └── Or /search for text search

Step 3: Purchase
   └── Click product → Read description, reviews
   └── "Buy Now" → Choose payment method:
       ├── Wallet (if sufficient balance)
       └── Razorpay (card, UPI, netbanking)

Step 4: Receive code
   └── Private repo created in your GitHub
   └── Check email for confirmation
   └── View in: Dashboard → Purchases

Step 5: Review
   └── After using, leave a rating (1-5 stars)
   └── Help other buyers decide
```

### 2.2 Seller Guide

```
Step 1: Register as developer
   └── Go to /developer-register
   └── Fill developer registration form

Step 2: List your first product
   └── /seller/products/new
   └── Title, description, price (min ₹49)
   └── Upload product image
   └── Add GitHub repo URL (source code)
   └── Add demo URL (optional live preview)
   └── Select category + tech stack + tags

Step 3: Set up payout method
   └── /seller/wallet → "Add Bank Account / UPI"
   └── Choose:
       ├── Bank Account (holder name, account no, IFSC, bank name)
       └── UPI ID (e.g., yourname@upi)
   └── Required before withdrawing earnings

Step 4: Track earnings
   └── /seller → Dashboard shows total sales, revenue
   └── /seller/earnings → Detailed analytics
   └── /seller/wallet → Balance, escrow, transactions

Step 5: Withdraw
   └── Available balance = withdrawable
   └── Min ₹500 → Enter amount → Withdraw
   └── Funds sent to your bank/UPI
```

---

## 3. Common Issues & Solutions

### Account Issues

| Issue | Solution |
|-------|---------|
| **Forgot password** | Click "Forgot Password" on login page → Check email → Reset |
| **Can't log in** | Check email spelling → Clear cookies → Try again → Contact support |
| **Account locked** | Too many login attempts → Wait 12 seconds → Try again |
| **Email not verified** | Check spam folder → Click verification link |

### Payment Issues

| Issue | Solution |
|-------|---------|
| **Razorpay payment failed** | Check card/UPI details → Try different method → Contact Razorpay support |
| **Money deducted but no order** | Wait 5 minutes → Check Dashboard → Purchases. If still missing, email support with payment ID |
| **Wallet top-up not reflecting** | Razorpay verification may take a moment → Refresh page → Check transactions |
| **Withdrawal failed** | Ensure payout method is added → Check sufficient balance (min ₹500) → Contact support |

### Product Issues

| Issue | Solution |
|-------|---------|
| **Code not delivered to GitHub** | Check GitHub email matches → Wait 5 minutes → Contact seller → Raise dispute |
| **Product doesn't work** | Read documentation carefully → Contact seller first → If unresolved, raise dispute within 7 days |
| **Can't download/access code** | Check GitHub repo is private and you have access → Contact seller |
| **Wrong product delivered** | Raise dispute immediately with order ID |

### Seller Issues

| Issue | Solution |
|-------|---------|
| **Can't list product** | Ensure you have developer role → Check all required fields → Min price ₹49 |
| **Earnings in "pending"** | Escrow holds funds for 7 days → Auto-released after → Check /seller/wallet |
| **Can't withdraw** | Add payout method first (bank/UPI) → Min ₹500 → Check balance |
| **Image upload fails** | Use JPEG/PNG/GIF/WebP → Max 5MB → Try again |

---

## 4. Technical Requirements

### For Buyers
- Modern web browser (Chrome, Firefox, Safari, Edge — latest version)
- GitHub account (to receive purchased code)
- Valid payment method (card, UPI, netbanking via Razorpay)

### For Sellers
- All buyer requirements, plus:
- GitHub repository with the source code you're selling
- Product image (JPEG/PNG/GIF/WebP, max 5MB)
- Bank account or UPI ID (for withdrawals)

### Supported Browsers
| Browser | Minimum Version |
|---------|----------------|
| Chrome | 120+ |
| Firefox | 120+ |
| Safari | 17+ |
| Edge | 120+ |

---

## 5. Escalation Path

If your issue isn't resolved, escalate in this order:

```
Level 1: Self-serve
   └── Check this Help document
   └── Check FAQ below

Level 2: Seller support (for product issues)
   └── Contact the seller directly
   └── Give them 48 hours to respond

Level 3: KodeDock support
   └── Email: support@kodedock.com
   └── Response within 24-48 hours

Level 4: Dispute resolution
   └── Raise formal dispute via Orders page
   └── KodeDock team mediates within 72 hours

Level 5: Grievance Officer
   └── Email: grievance@kodedock.com
   └── For unresolved or serious issues
```

---

## 6. FAQ

### General
**Q: Is KodeDock available outside India?**  
A: Currently, KodeDock serves the Indian market with INR payments via Razorpay. International expansion is planned.

**Q: Do I need a GitHub account?**  
A: Yes — code is delivered as a private GitHub repository. Create a free account at github.com if you don't have one.

**Q: Can I sell the code I bought?**  
A: No — purchases come with a personal use license. Reselling is prohibited.

### Wallet
**Q: Does wallet balance expire?**  
A: No, wallet balance has no expiry.

**Q: Can I transfer wallet balance to another user?**  
A: No, wallet balance is non-transferable.

**Q: Is wallet balance real money?**  
A: Wallet balance is a prepaid credit for Platform use. It's not legal tender outside KodeDock.

### Security
**Q: Is my bank account safe?**  
A: Yes — account numbers are masked in all interfaces (only last 4 digits visible). They're stored securely and never shared with third parties.

**Q: How are passwords stored?**  
A: Passwords are hashed using Argon2 (industry-best, memory-hard algorithm). We never store or see your plain password.

**Q: Why is my token in a cookie?**  
A: We use HttpOnly cookies that JavaScript cannot access, making XSS token theft impossible.

---

## 7. Contact Channels

| Need | Channel | Response Time |
|------|---------|---------------|
| **General help** | support@kodedock.com | 24–48 hours |
| **Refunds** | refunds@kodedock.com | 48 hours |
| **Disputes** | disputes@kodedock.com | 72 hours |
| **Security bugs** | security@kodedock.com | 24 hours |
| **Privacy/grievance** | grievance@kodedock.com | 48 hours |
| **Business/partnership** | hello@kodedock.com | 3–5 business days |

See [Contact](05-CONTACT.md) for full contact details.

---

## 8. Feature Requests & Feedback

We love hearing from our community:

- **Feature requests:** Email features@kodedock.com with your idea
- **Bug reports:** Email bugs@kodedock.com with screenshots and steps to reproduce
- **General feedback:** Email feedback@kodedock.com

We review all feedback weekly and prioritize based on community impact.

---

*Document Version: 1.0 | Last Updated: August 2026*

© 2025-2026 KodeDock. All rights reserved.
