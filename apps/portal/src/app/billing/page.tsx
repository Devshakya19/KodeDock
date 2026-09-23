"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { OrderInvoice } from "../../types/portal";
import { Receipt, Download, IndianRupee, ShieldCheck } from "lucide-react";

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } as any,
  }),
};

export default function BillingPage() {
  const [orders, setOrders] = useState<OrderInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/orders")
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setOrders(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpentPaise     = orders.reduce((sum, o) => sum + o.amountPaise, 0);
  const formattedTotalSpent = `₹${(totalSpentPaise / 100).toLocaleString("en-IN")}`;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="page-eyebrow">Billing & Order Invoices</div>
        <h1 className="page-title">
          Transaction<br />
          <span style={{ color: "var(--accent-primary)" }}>Ledger & Receipts</span>
        </h1>
        <p className="page-subtitle">
          Official INR receipts, Razorpay transaction IDs, and GST tax invoice downloads for every acquisition.
        </p>
      </motion.div>

      {/* Stats Bento */}
      {!loading && (
        <div className="stats-bento">
          {[
            {
              icon: IndianRupee,
              label: "Total Investment",
              value: formattedTotalSpent,
              meta: "Lifetime Software Purchases",
              variant: "purple",
            },
            {
              icon: ShieldCheck,
              label: "Orders Completed",
              value: orders.length.toString(),
              meta: "100% Verified Transactions",
              variant: "green",
            },
            {
              icon: Receipt,
              label: "Payment Gateway",
              value: "INR",
              meta: "Razorpay / Cashfree · Instant Fulfillment",
              variant: "cyan",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className={`stat-cell ${s.variant}`}
                custom={i}
                variants={statVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="stat-cell-icon">
                  <Icon size={16} aria-hidden="true" />
                </div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.variant}`}>{s.value}</div>
                <div className="stat-meta">{s.meta}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Loading order ledger" />
          <p>Loading PostgreSQL Order Ledger...</p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Receipt size={24} aria-hidden="true" />
          </div>
          <h2 className="empty-title">No Orders Found</h2>
          <p className="empty-desc">
            Your order history and GST invoices will appear here once you make your first purchase on KodeDock.
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="data-table-wrap"
        >
          <table className="data-table" aria-label="Billing and orders">
            <thead>
              <tr>
                <th scope="col">Order Number</th>
                <th scope="col">Software Item</th>
                <th scope="col">Amount (INR)</th>
                <th scope="col">Payment Method</th>
                <th scope="col">Status</th>
                <th scope="col">Transaction ID</th>
                <th scope="col" style={{ textAlign: "right" }}>Tax Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <motion.tr
                  key={ord.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>
                    <span className="font-mono" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {ord.orderNumber}
                    </span>
                    <div className="font-mono text-muted" style={{ fontSize: "0.68rem", marginTop: "0.15rem" }}>
                      {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ord.productTitle}</span>
                  </td>

                  <td>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                      {ord.formattedAmount}
                    </span>
                  </td>

                  <td>
                    <span className="pill pill-purple">{ord.paymentMethod}</span>
                  </td>

                  <td>
                    <span className={`pill ${ord.paymentStatus === "COMPLETED" ? "pill-success" : "pill-warning"}`}>
                      <ShieldCheck size={10} aria-hidden="true" />
                      {ord.paymentStatus}
                    </span>
                  </td>

                  <td>
                    <code className="font-mono text-muted" style={{ fontSize: "0.68rem" }}>
                      {ord.transactionId}
                    </code>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Downloading GST Invoice for ${ord.orderNumber}…`)}
                      aria-label={`Download PDF invoice for order ${ord.orderNumber}`}
                    >
                      <Download size={13} aria-hidden="true" />
                      <span>PDF Invoice</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
