import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings as SettingsIcon, Save, User, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const settingsSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().optional().or(z.literal("")),
    confirm_password: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirm_password) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    },
  );

type SettingsValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { staff, token, login } = useAuth();

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: staff?.name || "",
      password: "",
      confirm_password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SettingsValues) => {
      const payload: any = { full_name: values.full_name };
      if (values.password) {
        payload.password = values.password;
      }
      const res = await api.put("/api/hq/settings", payload);
      return { res, newName: values.full_name };
    },
    onSuccess: (data) => {
      toast.success("Settings updated successfully!");
      if (staff && token) {
        login(token, { ...staff, name: data.newName });
      }
      form.reset({
        full_name: data.newName,
        password: "",
        confirm_password: "",
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update settings.");
    },
  });

  const onSubmit = (data: SettingsValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-indigo-500" />
            HQ Settings
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage your admin profile and platform configurations.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Admin Profile Settings
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
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
              <p className="text-xs text-muted-foreground">
                Admin emails cannot be changed for security reasons.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Full Name
              </label>
              <input
                type="text"
                {...form.register("full_name")}
                className={cn(
                  "w-full bg-background border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary",
                  form.formState.errors.full_name
                    ? "border-rose-500"
                    : "border-input",
                )}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-rose-500 font-medium">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" /> Change
                Password
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    {...form.register("password")}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-background border border-input rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...form.register("confirm_password")}
                    className={cn(
                      "w-full bg-background border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary",
                      form.formState.errors.confirm_password
                        ? "border-rose-500"
                        : "border-input",
                    )}
                  />
                  {form.formState.errors.confirm_password && (
                    <p className="text-sm text-rose-500 font-medium">
                      {form.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? (
                "Saving..."
              ) : (
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
