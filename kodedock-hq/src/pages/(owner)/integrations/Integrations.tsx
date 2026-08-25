import { useState } from "react";
import { Link2, Key, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Integration = {
  provider: string;
  is_active: boolean;
  config: Record<string, string>;
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
          className="w-full pl-9 pr-10 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
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
  const queryClient = useQueryClient();
  const [localConfigs, setLocalConfigs] = useState<Record<string, Record<string, string>>>({});

  const { data: response, isLoading } = useQuery({
    queryKey: ['hq-integrations'],
    queryFn: async () => await api.get("/api/hq/platform/integrations")
  });

  const integrations: Integration[] = response?.data || [];

  const mutation = useMutation({
    mutationFn: async ({ provider, is_active, config }: Integration) => {
      await api.put(`/api/hq/platform/integrations/${provider}`, { is_active, config });
      return provider;
    },
    onSuccess: (provider) => {
      toast.success(`${provider.toUpperCase()} integration updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['hq-integrations'] });
    },
    onError: () => {
      toast.error("Failed to update integration configuration");
    }
  });

  const updateLocalConfig = (provider: string, key: string, value: string) => {
    setLocalConfigs(prev => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [key]: value
      }
    }));
  };

  const handleSave = (integ: Integration) => {
    // Merge server config with any local unsaved edits
    const updatedConfig = { ...integ.config, ...(localConfigs[integ.provider] || {}) };
    mutation.mutate({ ...integ, config: updatedConfig });
  };

  const handleToggle = (integ: Integration, checked: boolean) => {
    const updatedConfig = { ...integ.config, ...(localConfigs[integ.provider] || {}) };
    mutation.mutate({ ...integ, is_active: checked, config: updatedConfig });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Integrations</h2>
        <p className="text-muted-foreground mt-1">Configure third-party API keys and webhooks.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground p-10 text-center">Loading integrations...</p>
        ) : (
          integrations.map(integ => {
            const mergedConfig = { ...integ.config, ...(localConfigs[integ.provider] || {}) };
            const isSaving = mutation.isPending && mutation.variables?.provider === integ.provider;

            return (
              <div key={integ.provider} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 bg-secondary/20 border-b border-border flex items-center justify-between">
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
                        disabled={mutation.isPending}
                        onChange={(e) => handleToggle(integ, e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  {Object.keys(mergedConfig).map(key => (
                    <ConfigInput
                      key={key}
                      provider={integ.provider}
                      configKey={key}
                      value={mergedConfig[key]}
                      onChange={(val) => updateLocalConfig(integ.provider, key, val)}
                    />
                  ))}
                  
                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => handleSave(integ)}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <CheckCircle2 className="w-4 h-4 animate-pulse" /> : "Save Configuration"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
