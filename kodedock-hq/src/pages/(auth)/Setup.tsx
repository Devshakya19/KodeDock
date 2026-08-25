import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ServerCrash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

const setupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SetupValues = z.infer<typeof setupSchema>;

export default function Setup() {
  const navigate = useNavigate();

  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: async (values: SetupValues) => {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/hq/setup`, values);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("System Initialized! Owner account created.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Failed to run setup.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to connect to the core-engine.");
    }
  });

  const onSubmit = (data: SetupValues) => mutation.mutate(data);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Setup Card */}
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-14 w-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <ServerCrash className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">HQ Initialization</h2>
          <p className="text-zinc-400 text-sm">Create the root OWNER account to begin</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Full Name</label>
            <input
              type="text"
              {...form.register("name")}
              className={cn(
                "w-full bg-zinc-900/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-all placeholder:text-zinc-600",
                form.formState.errors.name ? "border-rose-500" : "border-zinc-800"
              )}
              placeholder="e.g., Dev Shakya"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Root Email</label>
            <input
              type="email"
              {...form.register("email")}
              className={cn(
                "w-full bg-zinc-900/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-all placeholder:text-zinc-600",
                form.formState.errors.email ? "border-rose-500" : "border-zinc-800"
              )}
              placeholder="admin@kodedock.com"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-rose-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Master Password</label>
            <input
              type="password"
              {...form.register("password")}
              className={cn(
                "w-full bg-zinc-900/50 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-all placeholder:text-zinc-600",
                form.formState.errors.password ? "border-rose-500" : "border-zinc-800"
              )}
              placeholder="Choose a strong password"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-rose-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || mutation.isSuccess}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
          >
            {mutation.isPending ? (
              <span className="animate-pulse">Configuring System...</span>
            ) : mutation.isSuccess ? (
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Ready</span>
            ) : (
              <>
                Initialize Root Access
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
