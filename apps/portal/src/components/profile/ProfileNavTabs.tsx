"use client";

import React, { useState } from "react";

export const ProfileNavTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Projects & Purchases", "Reviews", "Activity"];

  return (
    <div className="ref-nav-tabs-bar">
      {tabs.map((t) => {
        const isActive = activeTab === t;
        return (
          <button
            key={t}
            type="button"
            className={`ref-tab-pill ${isActive ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
};
