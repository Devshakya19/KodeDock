import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ArrowRight, Command } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      // Login doesn't use the authenticated api client
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/hq/login`, values);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        login(data.data.token, data.data.staff);
        toast.success("Authentication successful");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to connect to the server.");
    }
  });

  const onSubmit = (data: LoginValues) => mutation.mutate(data);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-14 w-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <Command className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">KodeDock HQ</h2>
          <p className="text-zinc-400 text-sm">Enter your credentials to access the control plane</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Staff Email</label>
            <input
              type="email"
              {...form.register("email")}
              className={cn(
                "w-full bg-zinc-900/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all placeholder:text-zinc-600",
                form.formState.errors.email ? "border-rose-500" : "border-zinc-800"
              )}
              placeholder="e.g., admin@kodedock.com"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-rose-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Password</label>
            </div>
            <input
              type="password"
              {...form.register("password")}
              className={cn(
                "w-full bg-zinc-900/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all placeholder:text-zinc-600",
                form.formState.errors.password ? "border-rose-500" : "border-zinc-800"
              )}
              placeholder="••••••••"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-rose-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
          >
            {mutation.isPending ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                Initialize Session
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Protected by KodeDock Zero-Trust Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
