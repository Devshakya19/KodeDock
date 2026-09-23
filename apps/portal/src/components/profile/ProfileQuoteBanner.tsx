"use client";

import React from "react";
import { Code2 } from "lucide-react";

export const ProfileQuoteBanner: React.FC = () => {
  return (
    <div className="ref-quote-banner">
      <div className="ref-quote-icon-wrap">
        <Code2 size={16} color="#8B5CF6" aria-hidden="true" />
      </div>
      <span className="ref-quote-text">
        Good ideas need great developers.
      </span>
    </div>
  );
};
