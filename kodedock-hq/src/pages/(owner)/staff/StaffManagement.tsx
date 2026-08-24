import { useState, useEffect } from "react";
import { UserPlus, MoreVertical, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

type Staff = {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
};

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", role_id: "" });
  const [inviteResult, setInviteResult] = useState<{password?: string, error?: string} | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/staff", {
        headers: { Authorization: `Bearer ${localStorage.getItem("hq_token")}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setStaffList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/hq/staff", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("hq_token")}` 
        },
        body: JSON.stringify(inviteData)
      });
      const data = await res.json();
      if (data.status === "success") {
        setInviteResult({ password: data.data.temporary_password });
        fetchStaff();
      } else {
        setInviteResult({ error: data.message });
      }
    } catch (error: any) {
      setInviteResult({ error: error.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage admin accounts, roles, and access permissions.
          </p>
        </div>
        <button 
          onClick={() => { setShowInviteModal(true); setInviteResult(null); setInviteData({name: "", email: "", role_id: ""}); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Name & Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Last Login</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No staff found.</td></tr>
            ) : (
              staffList.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-muted-foreground text-xs">{s.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                      {s.role_name || "Super Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-green-500 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-500 text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {s.last_login_at ? new Date(s.last_login_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).replace(/,/g, "") : "Never"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Invite New Staff</h3>
              <p className="text-sm text-muted-foreground mt-1">They will receive a temporary password.</p>
            </div>
            
            {inviteResult?.password ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-md flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Staff Invited Successfully!</p>
                    <p className="text-sm mt-1">Please securely share this temporary password with them:</p>
                    <div className="mt-2 p-2 bg-background border border-border rounded font-mono text-center text-lg tracking-wider text-foreground">
                      {inviteResult.password}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="w-full bg-secondary text-foreground py-2 rounded-md font-medium text-sm hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                {inviteResult?.error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                    {inviteResult.error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input required type="text" className="w-full p-2 bg-background border border-border rounded-md text-sm" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input required type="email" className="w-full p-2 bg-background border border-border rounded-md text-sm" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">Send Invite</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
