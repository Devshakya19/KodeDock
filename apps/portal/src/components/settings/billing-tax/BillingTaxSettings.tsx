"use client";

import React from "react";
import { Receipt } from "lucide-react";

export const BillingTaxSettings: React.FC = () => {
  return (
    <section className="section-card" id="settings-billing-tax">
      <div className="section-card-header">
        <div>
          <div className="card-title">Billing & Tax Information</div>
          <div className="card-desc">GST number for business invoicing, billing address, and PAN details for Indian tax compliance.</div>
        </div>
        <Receipt size={18} color="var(--accent-primary)" aria-hidden="true" />
      </div>

      <div className="section-card-body">
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="gstin" className="form-label">GSTIN (GST Number)</label>
            <input id="gstin" type="text" className="form-input font-mono" placeholder="22AAAAA0000A1Z5" maxLength={15} />
            <div className="form-helper">Optional — enter for B2B GST invoices on purchases.</div>
          </div>

          <div className="form-group">
            <label htmlFor="pan" className="form-label">PAN Number</label>
            <input id="pan" type="text" className="form-input font-mono" placeholder="AAAAA0000A" maxLength={10} />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="billing-address" className="form-label">Billing Address</label>
            <textarea id="billing-address" className="form-textarea" placeholder="Full billing address for GST invoice..." rows={3} />
          </div>

          <div className="form-group">
            <label htmlFor="billing-city" className="form-label">City</label>
            <input id="billing-city" type="text" className="form-input" placeholder="Mumbai" />
          </div>

          <div className="form-group">
            <label htmlFor="billing-state" className="form-label">State</label>
            <input id="billing-state" type="text" className="form-input" placeholder="Maharashtra" />
          </div>
        </div>
      </div>

      <div className="section-card-footer">
        <button type="button" className="btn btn-primary btn-md">Save Tax Info</button>
      </div>
    </section>
  );
};
