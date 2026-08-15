"use client";
import { useState, useEffect } from "react";
import { Bell, Save, Loader2, Mail, Smartphone } from "lucide-react";
import { apiGet, apiPost } from "@/shared/lib/api";

interface NotificationPrefs {
  email_sales: boolean;
  email_reviews: boolean;
  email_updates: boolean;
  push_sales: boolean;
  push_reviews: boolean;
  push_updates: boolean;
}

export default function NotificationsSettingsPage() {
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">Configure email and push alerts</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Email Settings */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-slate-400" /> Email Notifications
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
                description="Important updates about CodeHaat platform features"
                checked={prefs.email_updates}
                onChange={() => handleToggle('email_updates')}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Push Settings */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-slate-400" /> Push Notifications
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className={`text-[13px] font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
    <label className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-slate-200 transition-colors">
      <div>
        <div className="font-bold text-[14px] text-slate-900">{label}</div>
        <div className="text-[13px] text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className="relative inline-flex items-center">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={onChange} 
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </div>
    </label>
  );
}
