import { useState, useEffect } from "react";
import { Link2, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

type Integration = {
  provider: string;
  is_active: boolean;
  config: any;
};


function ConfigInput({ provider, configKey, value, onChange }: { provider: string, configKey: string, value: string, onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground capitalize">{configKey.replace(/_/g, ' ')}</label>
      <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type={show ? "text" : "password"}
          placeholder={`Enter ${configKey}...`}
          className="w-full pl-9 pr-10 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/platform/integrations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("hq_token")}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setIntegrations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (provider: string, key: string, value: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.provider === provider) {
        return { ...i, config: { ...i.config, [key]: value } };
      }
      return i;
    }));
  };

  const handleSave = async (provider: string) => {
    setSaving(provider);
    const integ = integrations.find(i => i.provider === provider);
    if (!integ) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/hq/platform/integrations/${provider}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("hq_token")}` 
        },
        body: JSON.stringify({ is_active: integ.is_active, config: integ.config })
      });
    } catch (error) {
      console.error("Failed to save integration:", error);
    } finally {
      setTimeout(() => setSaving(null), 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Integrations</h2>
        <p className="text-muted-foreground mt-1">Configure third-party API keys and webhooks.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading integrations...</p>
        ) : (
          integrations.map(integ => (
            <div key={integ.provider} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-bold text-foreground capitalize">{integ.provider}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={integ.is_active}
                      onChange={(e) => {
                        setIntegrations(prev => prev.map(i => 
                          i.provider === integ.provider ? { ...i, is_active: e.target.checked } : i
                        ));
                      }}
                    />
                    <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {Object.keys(integ.config || {}).map(key => (
                  <ConfigInput
                    key={key}
                    provider={integ.provider}
                    configKey={key}
                    value={integ.config[key] || ""}
                    onChange={(val) => updateConfig(integ.provider, key, val)}
                  />
                ))}
                
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => handleSave(integ.provider)}
                    disabled={saving === integ.provider}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving === integ.provider ? <CheckCircle2 className="w-4 h-4" /> : "Save Configuration"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
