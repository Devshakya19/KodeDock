import { useEffect, useState } from "react";
import {
  Percent,
  Wrench,
  CheckCircle2,
  ServerCrash,
  Activity,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

// Premium Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function PlatformSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

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
      const comm = response.data.find((s: Setting) => s.key === "commission_rate");
      const maint = response.data.find((s: Setting) => s.key === "maintenance_mode");

      form.reset({
        commission_rate: comm ? (comm.value?.bps ? comm.value.bps / 100 : 2.5) : 2.5,
        maintenance_mode: maint ? maint.value?.enabled === true : false,
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
      toast.success(`${key.replace("_", " ").toUpperCase()} updated successfully!`, {
        description: "The platform has been synced with the new configuration.",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
      });
      queryClient.invalidateQueries({ queryKey: ["hq-platform-settings"] });
    },
    onError: () => {
      toast.error("Configuration Sync Failed", {
        description: "An error occurred while updating the global state."
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Initializing Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-24">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border/40 pb-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl tracking-tight font-black text-foreground">Global Configuration</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Command center for KodeDock's core economic variables and platform availability state.
          </p>
        </div>
      </motion.div>

      {/* Main Settings Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Navigation Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 text-left",
              activeTab === "general" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Activity className="w-4 h-4" /> Operations & Economics
          </button>
          <button 
            onClick={() => setActiveTab("maintenance")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 text-left",
              activeTab === "maintenance" ? "bg-red-500/10 text-red-500" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <ServerCrash className="w-4 h-4" /> System Outages
          </button>
        </motion.div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Commission Setting Card - Double Bezel Premium */}
                <div className="relative p-1 rounded-2xl bg-gradient-to-b from-border/50 to-transparent">
                  <div className="bg-card rounded-[14px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col md:flex-row gap-10 items-start justify-between">
                    <div className="max-w-md space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Percent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Platform Commission Rate</h3>
                        <p className="text-muted-foreground leading-relaxed mt-2 text-sm">
                          This defines the global cut taken from every successful transaction on the marketplace. Changes are applied instantly to all new checkouts.
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0 flex flex-col gap-4">
                      <div className="relative group">
                        <input
                          type="number"
                          step="0.1"
                          {...form.register("commission_rate", { valueAsNumber: true })}
                          className="w-full md:w-48 text-4xl font-black bg-transparent border-b-2 border-border/50 py-3 pr-12 outline-none focus:border-primary transition-colors text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl font-black text-muted-foreground/30 pointer-events-none group-focus-within:text-primary/50 transition-colors">
                          %
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          mutation.mutate({
                            key: "commission_rate",
                            value: { bps: Math.round(form.getValues().commission_rate * 100) },
                          })
                        }
                        disabled={mutation.isPending}
                        className="w-full py-3.5 px-6 rounded-xl bg-foreground text-background font-bold text-sm tracking-wide hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {mutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Deploy Rate Update"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "maintenance" && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Maintenance Setting Card */}
                <div className="relative p-1 rounded-2xl bg-gradient-to-b from-red-500/20 to-transparent">
                  <div className="bg-card rounded-[14px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                      <div className="max-w-lg space-y-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground tracking-tight">Emergency Maintenance Mode</h3>
                          <p className="text-muted-foreground leading-relaxed mt-2 text-sm">
                            Flipping this switch immediately intercepts all public traffic and displays a "scheduled maintenance" overlay. Headquarters (HQ) access remains fully operational.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            {...form.register("maintenance_mode")}
                            onChange={(e) => {
                              form.setValue("maintenance_mode", e.target.checked);
                              mutation.mutate({
                                key: "maintenance_mode",
                                value: { enabled: e.target.checked, message: "We are currently undergoing scheduled maintenance." },
                              });
                            }}
                          />
                          <div className="w-16 h-8 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 group-hover:shadow-md transition-shadow"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
