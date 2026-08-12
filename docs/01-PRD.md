# CodeHaat — Project Requirement Document

> **"Haat" means marketplace in Hindi. CodeHaat is where code meets commerce.**

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Target Audience](#4-target-audience)
5. [Business Model](#5-business-model)
6. [MVP Scope (Phase 1) & Current Status](#6-mvp-scope-phase-1--current-status)
7. [Product Roadmap](#7-product-roadmap)
8. [Success Metrics](#8-success-metrics)
9. [Constraints & Assumptions](#9-constraints--assumptions)

---

## 1. Executive Summary

CodeHaat is India's first developer-focused digital goods marketplace that delivers code directly to buyers' GitHub accounts as private repositories — no .zip files, no extraction, just clone and build.

**The Problem:** Indian developers create thousands of valuable projects, templates, and tools every year but have no affordable platform to sell them. Global alternatives like CodeCanyon charge 20-55% commission and distribute static .zip files.

**The Solution:** A marketplace with 2.5% commission (lowest in the market) that uses GitHub integration to automatically create private repos in buyers' accounts upon purchase.

---

## 2. Problem Statement

| # | Problem | Impact |
|---|---------|--------|
| 1 | No affordable Indian marketplace for code | Creators forced to use global platforms with 20-55% commission |
| 2 | Static .zip file delivery | No version control, no updates, no collaboration |
| 3 | No localized experience | No INR pricing, no Indian payment methods |
| 4 | Complex onboarding | Lengthy verification, complex upload processes |
| 5 | No student-friendly platform | B.Tech projects have no marketplace |
| 6 | Delayed payouts | Global platforms have 30-60 day payout cycles |

---

## 3. Solution Overview

### What CodeHaat Does

1. **Sellers** connect their GitHub account, link repos, set prices
2. **Buyers** browse, preview, and purchase code
3. **On purchase**, a private repo is automatically created in the buyer's GitHub account
4. **Payments** go through escrow with a 7-day dispute window
5. **Sellers** get paid after the 7-day hold, retaining 97.5% of the sale (2.5% platform commission)

### How It's Different

| Feature | CodeHaat | CodeCanyon | Gumroad |
|---------|----------|------------|---------|
| Commission | 2.5% | 20-55% | 10% |
| Delivery | GitHub Repo | .zip File | File Download |
| Live Preview | Yes | No | No |
| Escrow System | Yes (7 days) | No | No |
| Indian Focus | Yes | No | No |
| INR Payments | Native | Converted | Converted |
| Payout Speed | 7 days | 30-60 days | 7 days |

---

## 4. Target Audience

### Buyers (Consumers)

| Persona | Description | Budget |
|---------|-------------|--------|
| **Students** | B.Tech students needing project code | ₹50-500 |
| **Freelancers** | Developers needing templates for clients | ₹500-5,000 |
| **Startups** | Needing boilerplates and starter kits | ₹1,000-20,000 |

### Sellers (Creators)

| Persona | Description | Goal |
|---------|-------------|------|
| **B.Tech Graduates** | Have side projects to monetize | Passive income |
| **Senior Developers** | Have production-grade templates | Monthly revenue |
| **UI/UX Designers** | Have design assets and kits | Community exposure |

---

## 5. Business Model

### Revenue Streams

| Stream | Rate | Phase |
|--------|------|-------|
| Transaction Commission | 2.5% per sale | MVP (v1.0.0+) |
| Featured Listings | ₹99-999/listing | Phase 2 |
| Sponsored Categories | ₹499-2,999/month | Phase 2 |
| Premium Seller Account | ₹199/month | Phase 3 |

### Unit Economics

| Metric | Value |
|--------|-------|
| Average Order Value | ₹500 |
| Platform Commission (2.5%) | ₹12.50 |
| Razorpay Fee (~2%) | ₹10 |
| Seller Receives (97.5% before PG fee) | ₹477.50 |
| Break-even | 200-300 transactions/month |

---

## 6. MVP Scope (Phase 1) & Current Status

### What's Included (Implemented in v1.3.0)

- [x] Authentication (Email + GitHub OAuth)
- [x] Product Browsing (Search, Filter, Category)
- [x] Product Detail Pages
- [x] Paper Money Wallet (mock payments)
- [x] Purchase Flow (Buy Now)
- [x] Seller Dashboard
- [x] Product Listing (CRUD)
- [x] Order History
- [x] Basic Admin Panel
- [x] Real Razorpay Payments integration
- [x] GitHub Repo Transfer delivery mechanism
- [x] Escrow System (7-day hold)

---

## 7. Product Roadmap

### Phase 2: Engagement & Discovery
- [ ] Live Preview Sandbox for templates
- [ ] Featured Listings & Sponsored Categories
- [ ] Advanced User Reviews & Ratings
- [ ] Developer Q&A / Support section per product

### Phase 3: Scaling & Ecosystem
- [ ] AI Recommendations & AI-powered Search
- [ ] Mobile App for Buyers and Sellers
- [ ] Public API Access for third-party integrations
- [ ] Premium Seller Subscriptions

---

## 8. Success Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| Registered Users | 10,000+ |
| Active Sellers | 500+ |
| Products Listed | 2,000+ |
| Monthly Transactions | 1,000+ |
| Monthly Revenue | ₹1,25,000+ |
| Customer Satisfaction | 4.5/5 |

---

## 9. Constraints & Assumptions

### Constraints

- Solo founder — limited development time
- Self-funded Phase 1 — minimal infrastructure costs
- Must be production-grade from day one (millions of users expected)

### Assumptions

- Indian developer market is underserved
- GitHub integration is a strong differentiator
- 2.5% commission is sustainable at scale
- Real payments and automated GitHub repo transfers effectively eliminate friction

---

*Document Version: 1.3.0 | Last Updated: August 2026*
