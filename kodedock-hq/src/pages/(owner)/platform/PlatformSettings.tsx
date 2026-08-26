import { useEffect } from "react";
import {
  Sliders,
  Save,
  Percent,
  Wrench,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type Setting = {
  key: string;
  value: any;
  description: string | null;
};

const platformSchema = z.object({
  commission_rate: z.number().min(0).max(100),
  maintenance_mode: z.boolean(),
});

type PlatformValues = z.infer<typeof platformSchema>;

export default function PlatformSettings() {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["hq-platform-settings"],
    queryFn: async () => await api.get("/api/hq/platform/settings"),
  });

  const form = useForm<PlatformValues>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      commission_rate: 2.5,
      maintenance_mode: false,
    },
  });

  // Populate form when data arrives
  useEffect(() => {
    if (response?.data) {
      const comm = response.data.find(
        (s: Setting) => s.key === "commission_rate",
      );
      const maint = response.data.find(
        (s: Setting) => s.key === "maintenance_mode",
      );

      form.reset({
        commission_rate: comm ? parseFloat(comm.value) : 2.5,
        maintenance_mode: maint ? maint.value === true : false,
      });
    }
  }, [response?.data, form]);

  const mutation = useMutation({
    mutationFn: async (payload: { key: string; value: any }) => {
      await api.put(`/api/hq/platform/settings/${payload.key}`, {
        value: payload.value,
      });
      return payload.key;
    },
    onSuccess: (key) => {
      toast.success(
        `${key.replace("_", " ").toUpperCase()} updated successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ["hq-platform-settings"] });
    },
    onError: () => {
      toast.error("Failed to update platform setting.");
    },
  });

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Platform Configuration
        </h2>
        <p className="text-muted-foreground mt-1 font-medium">
          Manage global platform settings and feature flags.
        </p>
      </div>

      <div className="space-y-6">
        {/* Commission Setting */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex gap-4">
            <div className="p-3 bg-secondary rounded-lg shrink-0 h-fit">
              <Percent className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                Global Commission Rate
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                The percentage fee charged on every successful seller
                withdrawal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                {...form.register("commission_rate", { valueAsNumber: true })}
                className="w-24 p-2.5 pr-8 bg-background border border-input rounded-md text-sm text-right font-medium focus:outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                %
              </span>
            </div>
            <button
              onClick={() =>
                mutation.mutate({
                  key: "commission_rate",
                  value: form.getValues().commission_rate,
                })
              }
              disabled={mutation.isPending}
              className="flex items-center justify-center min-w-[90px] gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? (
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg shrink-0 h-fit">
              <Wrench className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When enabled, buyers and sellers will see a maintenance screen.
                HQ will still be accessible.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...form.register("maintenance_mode")}
                onChange={(e) => {
                  form.setValue("maintenance_mode", e.target.checked);
                  mutation.mutate({
                    key: "maintenance_mode",
                    value: e.target.checked,
                  });
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
