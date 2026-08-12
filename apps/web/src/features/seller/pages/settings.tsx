"use client";
import { AccountSettings } from "@/shared/components/account-settings";

export default function SellerSettingsPage() {
  return (
    <AccountSettings 
      backLink="/seller"
      backText="Back to Dashboard"
      deleteWarningText="Permanently delete your seller account, all active product listings, and remove all associated data."
    />
  );
}
