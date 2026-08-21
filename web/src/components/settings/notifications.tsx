"use client";
import { useState, useEffect } from "react";
import { Bell, Save, Loader2, Mail, Smartphone } from "lucide-react";
import { apiGet, apiPost } from "@/shared/lib/api/client";
import { theme } from "@/shared/lib/theme";

interface NotificationPrefs {
  email_sales: boolean;
  email_reviews: boolean;
  email_updates: boolean;
  push_sales: boolean;
  push_reviews: boolean;
  push_updates: boolean;
}

export function NotificationsSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email_sales: true,
    email_reviews: true,
    email_updates: true,
    push_sales: true,
    push_reviews: true,
    push_updates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await apiGet<NotificationPrefs>("/seller/notification-preferences");
        if (res.success && res.data) {
          setPrefs(res.data);
        } else if (res.error) {
          setMessage(res.error);
        }
      } catch (e) {
        console.error("Failed to load prefs", e);
        setMessage("Network error while loading.");
      } finally {
        setLoading(false);
      }
    }
    loadPrefs();
  }, []);

  const handleToggle = (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
    setMessage(""); // clear previous messages on edit
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await apiPost<NotificationPrefs>("/seller/notification-preferences", prefs);
      if (res.success) {
        setMessage("Preferences saved successfully!");
      } else {
        setMessage(res.error || "Failed to save preferences.");
      }
    } catch (e) {
      setMessage("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={theme.components.card}>
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
            <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Configure email and push alerts</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Email Settings */}
          <div>
            <h3 className="text-[15px] font-bold text-foreground flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-muted-foreground" /> Email Notifications
            </h3>
            <div className="space-y-3">
              <ToggleRow 
                label="New Sales" 
                description="Get notified when someone purchases your product"
                checked={prefs.email_sales}
                onChange={() => handleToggle('email_sales')}
              />
              <ToggleRow 
                label="New Reviews" 
                description="Receive an email when a customer leaves a review"
                checked={prefs.email_reviews}
                onChange={() => handleToggle('email_reviews')}
              />
              <ToggleRow 
                label="Platform Updates" 
                description="Important updates about KodeDock platform features"
                checked={prefs.email_updates}
                onChange={() => handleToggle('email_updates')}
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* Push Settings */}
          <div>
            <h3 className="text-[15px] font-bold text-foreground flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-muted-foreground" /> Push Notifications
            </h3>
            <div className="space-y-3">
              <ToggleRow 
                label="New Sales" 
                description="Instant push alerts for every new sale"
                checked={prefs.push_sales}
                onChange={() => handleToggle('push_sales')}
              />
              <ToggleRow 
                label="New Reviews" 
                description="Instant push alerts for new product reviews"
                checked={prefs.push_reviews}
                onChange={() => handleToggle('push_reviews')}
              />
              <ToggleRow 
                label="Platform Updates" 
                description="Instant push alerts for critical platform changes"
                checked={prefs.push_updates}
                onChange={() => handleToggle('push_updates')}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className={`text-[13px] font-medium ${message.includes('success') ? 'text-green-600' : 'text-destructive'}`}>
              {message}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-6 rounded-xl bg-accent text-primary-foreground font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) {
  return (
    <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div>
        <div className="font-bold text-[14px] text-foreground">{label}</div>
        <div className="text-[13px] text-muted-foreground mt-0.5">{description}</div>
      </div>
      <div className="relative inline-flex items-center">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={onChange} 
        />
        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:dark:bg-primary"></div>
      </div>
    </label>
  );
}
