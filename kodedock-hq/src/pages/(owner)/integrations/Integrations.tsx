import { useState, useEffect } from "react";
import {
  Link2,
  Key,
  CheckCircle2,
  Eye,
  EyeOff,
  CreditCard,
  Cloud,
  Database,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
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
  if (p.includes("stripe"))
    return {
      icon: CreditCard,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      desc: "Payment gateway for processing orders and payouts.",
    };
  if (p.includes("aws") || p.includes("s3"))
    return {
      icon: Cloud,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      desc: "Cloud storage for product files and assets.",
    };
  if (p.includes("sendgrid") || p.includes("mail"))
    return {
      icon: Mail,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      desc: "Transactional email delivery service.",
    };
  if (p.includes("redis") || p.includes("db"))
    return {
      icon: Database,
      color: "text-red-500",
      bg: "bg-red-500/10",
      desc: "In-memory caching and database.",
    };
  if (p.includes("github"))
    return {
      icon: Link2,
      color: "text-foreground",
      bg: "bg-secondary",
      desc: "OAuth authentication and repository sync.",
    };
  if (p.includes("google"))
    return {
      icon: Link2,
      color: "text-foreground",
      bg: "bg-secondary",
      desc: "OAuth authentication and services.",
    };
  return {
    icon: Link2,
    color: "text-foreground",
    bg: "bg-secondary",
    desc: "Third-party platform integration.",
  };
};

// Component to handle logo with fallback
function IntegrationLogo({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  const p = provider.toLowerCase();
  const [error, setError] = useState(false);
  const details = getProviderDetails(provider);
  const FallbackIcon = details.icon;

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl",
          details.bg,
          className,
        )}
      >
        <FallbackIcon className={cn("w-1/2 h-1/2", details.color)} />
      </div>
    );
  }

  // Handle known variations mapping if necessary
  let logoName = p;
  if (p.includes("s3")) logoName = "aws";

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-secondary/10 rounded-xl p-3 border border-border/50",
        className,
      )}
    >
      <img
        src={`/icons/tech/${logoName}.svg`}
        alt={`${provider} logo`}
        className="w-full h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
}

function ConfigInput({
  configKey,
  value,
  onChange,
}: {
  configKey: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {configKey.replace(/_/g, " ")}
      </label>
      <div className="relative group">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type={show ? "text" : "password"}
          placeholder={`Enter ${configKey}...`}
          className="w-full pl-9 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
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
  const [localConfigs, setLocalConfigs] = useState<
    Record<string, Record<string, string>>
  >({});
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["hq-integrations"],
    queryFn: async () => await api.get("/api/hq/platform/integrations"),
  });

  const integrations: Integration[] = response?.data || [];

  const mutation = useMutation({
    mutationFn: async ({ provider, is_active, config }: Integration) => {
      await api.put(`/api/hq/platform/integrations/${provider}`, {
        is_active,
        config,
      });
      return provider;
    },
    onSuccess: (provider) => {
      toast.success(
        `${provider.toUpperCase()} integration updated successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ["hq-integrations"] });
      setSelectedProvider(null);
    },
    onError: () => {
      toast.error("Failed to update integration configuration");
    },
  });

  const updateLocalConfig = (provider: string, key: string, value: string) => {
    setLocalConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [key]: value,
      },
    }));
  };

  const handleSave = (integ: Integration) => {
    const updatedConfig = {
      ...integ.config,
      ...(localConfigs[integ.provider] || {}),
    };
    mutation.mutate({ ...integ, config: updatedConfig });
  };

  const handleToggle = (integ: Integration, checked: boolean) => {
    const updatedConfig = {
      ...integ.config,
      ...(localConfigs[integ.provider] || {}),
    };
    mutation.mutate({ ...integ, is_active: checked, config: updatedConfig });
  };

  const selectedInteg = integrations.find(
    (i) => i.provider === selectedProvider,
  );
  const selectedMergedConfig = selectedInteg
    ? {
        ...selectedInteg.config,
        ...(localConfigs[selectedInteg.provider] || {}),
      }
    : {};
  const isSaving =
    mutation.isPending && mutation.variables?.provider === selectedProvider;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProvider) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProvider]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            API Integrations
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Configure and manage third-party service connections.
          </p>
        </div>
        <div className="bg-secondary/50 text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border flex items-center gap-1.5 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> All keys are
          encrypted at rest
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-card border border-border rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="font-medium text-muted-foreground">
              Loading integrations...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {integrations.map((integ) => {
              const details = getProviderDetails(integ.provider);

              return (
                <button
                  key={integ.provider}
                  onClick={() => setSelectedProvider(integ.provider)}
                  className={cn(
                    "group relative flex flex-col items-center p-6 bg-card border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 active:scale-[0.98]",
                    integ.is_active
                      ? "border-primary/20"
                      : "border-border opacity-80",
                  )}
                >
                  <div className="absolute top-4 right-4">
                    {integ.is_active ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    ) : (
                      <span className="flex h-3 w-3 relative">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-muted-foreground/30"></span>
                      </span>
                    )}
                  </div>

                  <IntegrationLogo
                    provider={integ.provider}
                    className="w-20 h-20 mb-4 rounded-2xl bg-secondary/5 border-none"
                  />

                  <h3 className="text-lg font-bold text-foreground capitalize mt-2">
                    {integ.provider}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium text-center mt-2 line-clamp-2">
                    {details.desc}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Integration Configuration Modal */}
      {selectedInteg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedProvider(null)}
          ></div>
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-border bg-secondary/10">
              <div className="flex items-center gap-4">
                <IntegrationLogo
                  provider={selectedInteg.provider}
                  className="w-16 h-16 rounded-xl bg-background border border-border/50 shadow-sm"
                />
                <div>
                  <h3 className="text-2xl font-bold text-foreground capitalize">
                    {selectedInteg.provider}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getProviderDetails(selectedInteg.provider).desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border mb-8">
                <div>
                  <h4 className="font-bold text-foreground">
                    Enable Integration
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Turn this service on or off for your platform.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedInteg.is_active}
                    disabled={mutation.isPending}
                    onChange={(e) =>
                      handleToggle(selectedInteg, e.target.checked)
                    }
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="space-y-5">
                <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">
                  Configuration Secrets
                </h4>
                {Object.keys(selectedMergedConfig).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4">
                    No configuration keys required for this integration.
                  </p>
                ) : (
                  Object.keys(selectedMergedConfig).map((key) => (
                    <ConfigInput
                      key={key}
                      configKey={key}
                      value={selectedMergedConfig[key]}
                      onChange={(val) =>
                        updateLocalConfig(selectedInteg.provider, key, val)
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-card flex justify-end gap-3 mt-auto">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-5 py-2.5 rounded-lg font-bold text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(selectedInteg)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-foreground/90 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md"
              >
                {isSaving ? (
                  <CheckCircle2 className="w-4 h-4 animate-pulse" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
