"use client";
import { AccountSettings } from "@/shared/components/account-settings";

export default function BuyerSettingsPage() {
  return (
    <AccountSettings 
      backLink="/dashboard"
      backText="Back to Dashboard"
      deleteWarningText="Permanently delete your buyer account and all associated purchase records."
    />
  );
}
