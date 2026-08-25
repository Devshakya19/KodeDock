import { useState } from "react";
import { Link2, Key, CheckCircle2, Eye, EyeOff, CreditCard, Cloud, Database, Mail, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Integration = {
  provider: string;
  is_active: boolean;
  config: Record<string, string>;
};

const getProviderDetails = (provider: string) => {
  const p = provider.toLowerCase();
  if (p.includes('stripe')) return { icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Payment gateway for processing orders and payouts." };
  if (p.includes('aws') || p.includes('s3')) return { icon: Cloud, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Cloud storage for product files and assets." };
  if (p.includes('sendgrid') || p.includes('mail')) return { icon: Mail, color: "text-sky-500", bg: "bg-sky-500/10", desc: "Transactional email delivery service." };
  if (p.includes('redis') || p.includes('db')) return { icon: Database, color: "text-red-500", bg: "bg-red-500/10", desc: "In-memory caching and database." };
  return { icon: Link2, color: "text-foreground", bg: "bg-secondary", desc: "Third-party platform integration." };
};

function ConfigInput({ configKey, value, onChange }: { configKey: string, value: string, onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{configKey.replace(/_/g, ' ')}</label>
      <div className="relative group">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type={show ? "text" : "password"}
          placeholder={`Enter ${configKey}...`}
          className="w-full pl-9 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
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
    const updatedConfig = { ...integ.config, ...(localConfigs[integ.provider] || {}) };
    mutation.mutate({ ...integ, config: updatedConfig });
  };

  const handleToggle = (integ: Integration, checked: boolean) => {
    const updatedConfig = { ...integ.config, ...(localConfigs[integ.provider] || {}) };
    mutation.mutate({ ...integ, is_active: checked, config: updatedConfig });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">API Integrations</h2>
          <p className="text-muted-foreground mt-1 font-medium">Configure and manage third-party service connections.</p>
        </div>
        <div className="bg-secondary/50 text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border flex items-center gap-1.5 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> All keys are encrypted at rest
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-card border border-border rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="font-medium text-muted-foreground">Loading integrations...</p>
          </div>
        ) : (
          integrations.map(integ => {
            const mergedConfig = { ...integ.config, ...(localConfigs[integ.provider] || {}) };
            const isSaving = mutation.isPending && mutation.variables?.provider === integ.provider;
            const details = getProviderDetails(integ.provider);
            const Icon = details.icon;

            return (
              <div key={integ.provider} className={cn(
                "bg-card border rounded-xl overflow-hidden shadow-sm transition-all duration-300",
                integ.is_active ? "border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)]" : "border-border opacity-75 grayscale-[0.2]"
              )}>
                {/* Header Section */}
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/10">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl flex items-center justify-center", details.bg)}>
                      <Icon className={cn("w-6 h-6", details.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground capitalize">{integ.provider}</h3>
                        {integ.is_active ? (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                            Disconnected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 font-medium">{details.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 bg-background px-4 py-2 rounded-lg border border-border shadow-sm">
                    <span className="text-sm font-bold text-foreground">Enable</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={integ.is_active}
                        disabled={mutation.isPending}
                        onChange={(e) => handleToggle(integ, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                {/* Configuration Section */}
                <div className="p-6 bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {Object.keys(mergedConfig).map(key => (
                      <ConfigInput
                        key={key}
                        configKey={key}
                        value={mergedConfig[key]}
                        onChange={(val) => updateLocalConfig(integ.provider, key, val)}
                      />
                    ))}
                  </div>
                  
                  <div className="pt-8 flex justify-end">
                    <button 
                      onClick={() => handleSave(integ)}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-foreground/90 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md"
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
