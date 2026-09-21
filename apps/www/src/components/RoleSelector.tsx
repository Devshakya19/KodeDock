import React from "react";
import type { UserRole } from "@kodedock/types";
import { Terminal, Store } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="role-selector-wrap">
      <span className="role-label">Developer Account Type</span>
      <div className="role-tabs">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("BUYER")}
          className={`role-btn ${
            selectedRole === "BUYER" ? "active active-buyer" : ""
          }`}
          title="Acquire pre-built software, MCPs, and SaaS stacks"
        >
          <Terminal size={16} />
          <span>Buyer Developer</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("SELLER")}
          className={`role-btn ${
            selectedRole === "SELLER" ? "active active-seller" : ""
          }`}
          title="Publish codebases, earn 95% payout in INR"
        >
          <Store size={16} />
          <span>Seller Developer</span>
        </button>
      </div>
    </div>
  );
};
