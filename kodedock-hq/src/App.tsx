import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import AuthLayout from "@/layouts/AuthLayout";
import HqLayout from "@/layouts/HqLayout";

import Login from "@/pages/(auth)/Login";
import Setup from "@/pages/(auth)/Setup";

// Owner Pages
import Marketplace from "@/pages/(owner)/marketplace/Marketplace";
import Users from "@/pages/(owner)/users/Users";
import Finance from "@/pages/(owner)/finance/Finance";
import Safety from "@/pages/(owner)/safety/Safety";
import Settings from "@/pages/(owner)/settings/Settings";
import Support from "@/pages/(owner)/support/Support";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
          </Route>

          {/* Protected HQ Routes */}
          <Route path="/owner" element={<HqLayout />}>
            {/* Redirect /owner to the first actionable module */}
            <Route index element={<Navigate to="marketplace" replace />} />
            
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="users" element={<Users />} />
            <Route path="finance" element={<Finance />} />
            <Route path="safety" element={<Safety />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/owner/marketplace" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
