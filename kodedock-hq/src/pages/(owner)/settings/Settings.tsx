import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings as SettingsIcon, Save, User, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { staff, token, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: staff?.name || "",
    password: "",
    confirm_password: ""
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.password && formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { full_name: formData.full_name };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/settings", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        // Refresh local staff context with new name
        if (staff) {
          login(token!, { ...staff, name: formData.full_name });
        }
        setFormData(prev => ({ ...prev, password: "", confirm_password: "" }));
      } else {
        setError(data.message || "Failed to update settings.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-indigo-500" />
            HQ Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your admin profile and platform configurations.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Admin Profile Settings</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 text-rose-500 text-sm font-medium border border-rose-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-emerald-500/10 text-emerald-500 text-sm font-medium border border-emerald-500/20">
              Settings updated successfully!
            </div>
          )}

          <div className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
              </label>
              <input 
                type="email" 
                disabled 
                value={staff?.email || "admin@kodedock.com"} 
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Admin emails cannot be changed for security reasons.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Full Name
              </label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                className="w-full bg-background border border-input rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" /> Change Password
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">New Password (Optional)</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-background border border-input rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                
                {formData.password && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                      required={!!formData.password}
                      className="w-full bg-background border border-input rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-border">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4" /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
