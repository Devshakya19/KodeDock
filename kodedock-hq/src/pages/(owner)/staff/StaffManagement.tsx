import { useState } from "react";
import { UserPlus, MoreVertical, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Staff = {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
};

const inviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role_id: z.string().optional()
});

type InviteValues = z.infer<typeof inviteSchema>;

const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: "name",
    header: "Name & Email",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="text-muted-foreground text-xs">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "role_name",
    header: "Role",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
        {row.original.role_name || "Super Admin"}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => row.original.is_active ? (
      <span className="inline-flex items-center gap-1.5 text-green-500 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-red-500 text-xs font-medium">
        <XCircle className="w-3.5 h-3.5" /> Suspended
      </span>
    ),
  },
  {
    accessorKey: "last_login_at",
    header: "Last Login",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.last_login_at ? new Date(row.original.last_login_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).replace(/,/g, "") : "Never"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <StaffActionCell staff={row.original} />,
  },
];

const StaffActionCell = ({ staff }: { staff: Staff }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const statusMutation = useMutation({
    mutationFn: async (is_active: boolean) => {
      await api.put(`/api/hq/staff/${staff.id}/status`, { is_active });
    },
    onSuccess: () => {
      toast.success("Staff status updated");
      queryClient.invalidateQueries({ queryKey: ['hq-staff'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update status")
  });

  const roleMutation = useMutation({
    mutationFn: async (role_id: string | null) => {
      await api.put(`/api/hq/staff/${staff.id}/role`, { role_id });
    },
    onSuccess: () => {
      toast.success("Staff role updated");
      queryClient.invalidateQueries({ queryKey: ['hq-staff'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update role")
  });

  return (
    <div className="text-right relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-6 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden text-left">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Actions</p>
            </div>
            
            <button 
              onClick={() => roleMutation.mutate(null)} // Or fetch roles, but null is Super Admin for now
              disabled={roleMutation.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              Make Super Admin
            </button>

            <button 
              onClick={() => statusMutation.mutate(!staff.is_active)}
              disabled={statusMutation.isPending}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                staff.is_active 
                  ? "text-rose-500 hover:bg-rose-500/10" 
                  : "text-green-500 hover:bg-green-500/10"
              )}
            >
              {staff.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {staff.is_active ? "Suspend Account" : "Activate Account"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function StaffManagement() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['hq-staff'],
    queryFn: async () => await api.get("/api/hq/staff")
  });

  const staffList: Staff[] = response?.data || [];

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "", role_id: "" }
  });

  const mutation = useMutation({
    mutationFn: async (values: InviteValues) => {
      const res = await api.post("/api/hq/staff", values);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setTempPassword(data.data.temporary_password);
        toast.success("Staff member invited successfully!");
        queryClient.invalidateQueries({ queryKey: ['hq-staff'] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to invite staff member");
    }
  });

  const onSubmit = (data: InviteValues) => {
    mutation.mutate(data);
  };

  const closeAndReset = () => {
    setShowInviteModal(false);
    setTempPassword(null);
    form.reset();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Staff Management</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage admin accounts, roles, and access permissions.
          </p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading staff members...</div>
        ) : (
          <DataTable columns={columns} data={staffList} />
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-secondary/30">
              <h3 className="text-lg font-bold text-foreground">Invite New Staff</h3>
              <p className="text-sm text-muted-foreground mt-1">They will receive a temporary password.</p>
            </div>
            
            {tempPassword ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Staff Invited Successfully!</p>
                    <p className="text-sm mt-1 text-green-500/80">Please securely share this temporary password with them:</p>
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg font-mono text-center text-xl tracking-widest text-green-400 font-bold">
                      {tempPassword}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeAndReset}
                  className="w-full bg-secondary text-foreground py-2.5 rounded-md font-medium text-sm hover:bg-secondary/80 transition-colors mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input 
                    type="text" 
                    {...form.register("name")}
                    className={cn(
                      "w-full p-2.5 bg-background border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                      form.formState.errors.name ? "border-rose-500" : "border-input"
                    )}
                    placeholder="e.g., Jane Doe"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input 
                    type="email" 
                    {...form.register("email")}
                    className={cn(
                      "w-full p-2.5 bg-background border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                      form.formState.errors.email ? "border-rose-500" : "border-input"
                    )}
                    placeholder="jane.doe@kodedock.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={closeAndReset} 
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {mutation.isPending ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
