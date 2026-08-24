import { useState, useEffect } from "react";
import { Sliders, Save, Percent, Wrench, Shield, CheckCircle2 } from "lucide-react";

type Setting = {
  key: string;
  value: any;
  description: string | null;
};

export default function PlatformSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Local state for edits
  const [commission, setCommission] = useState("2.5");
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/platform/settings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("hq_token")}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setSettings(data.data);
        
        const comm = data.data.find((s: Setting) => s.key === "commission_rate");
        if (comm) setCommission(comm.value.toString());
        
        const maint = data.data.find((s: Setting) => s.key === "maintenance_mode");
        if (maint) setMaintenance(maint.value === true);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(key);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/hq/platform/settings/${key}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("hq_token")}` 
        },
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.error("Failed to save setting:", error);
    } finally {
      setTimeout(() => setSaving(null), 1000);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Configuration</h2>
        <p className="text-muted-foreground mt-1">Manage global platform settings and feature flags.</p>
      </div>

      <div className="space-y-6">
        {/* Commission Setting */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="p-3 bg-secondary rounded-lg shrink-0 h-fit">
              <Percent className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Global Commission Rate</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The percentage fee charged on every successful seller withdrawal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                className="w-24 p-2 pr-8 bg-background border border-border rounded-md text-sm text-right"
                value={commission}
                onChange={e => setCommission(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
            <button 
              onClick={() => handleSave("commission_rate", parseFloat(commission))}
              disabled={saving === "commission_rate"}
              className="flex items-center justify-center min-w-[90px] gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving === "commission_rate" ? <CheckCircle2 className="w-4 h-4" /> : "Save"}
            </button>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg shrink-0 h-fit">
              <Wrench className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When enabled, buyers and sellers will see a maintenance screen. HQ will still be accessible.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={maintenance}
                onChange={(e) => {
                  const val = e.target.checked;
                  setMaintenance(val);
                  handleSave("maintenance_mode", val);
                }}
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
