"use client";
import { AccountSettings } from "@/shared/components/account-settings";

export default function SellerSecurityPage() {
  return (
    <AccountSettings 
      deleteWarningText="Permanently delete your seller account, all active product listings, and remove all associated data."
      hideHeader={true}
    />
  );
}
