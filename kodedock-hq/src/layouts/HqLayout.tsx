import {
  Outlet,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  ShoppingBag,
  CreditCard,
  Shield,
  LifeBuoy,
  Settings,
  LogOut,
  Layers,
  Link2,
  Sliders,
  Activity,
  UserCog,
  Search,
  LayoutDashboard,
  Bell,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { Command as CommandPalette } from "cmdk";

export default function HqLayout() {
  const { isAuthenticated, logout, staff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
    }, 1500);
  }, [logout]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-logout after 15 minutes of inactivity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(
        () => {
          handleLogout();
        },
        15 * 60 * 1000,
      ); // 15 minutes
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) =>
        document.removeEventListener(event, resetTimer),
      );
    };
  }, [handleLogout]);

  // Toggle the command palette on Command+K or Ctrl+K, close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sections = [
    {
      title: "Overview",
      links: [
        { name: "Dashboard", path: "/owner/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Operations",
      links: [
        { name: "Marketplace", path: "/owner/marketplace", icon: ShoppingBag },
        { name: "Catalog", path: "/owner/catalog", icon: Layers },
        { name: "Users & Sellers", path: "/owner/users", icon: Users },
        { name: "Finance", path: "/owner/finance", icon: CreditCard },
      ],
    },
    {
      title: "Trust & Support",
      links: [
        { name: "Safety & Disputes", path: "/owner/safety", icon: Shield },
        { name: "Support Tickets", path: "/owner/support", icon: LifeBuoy },
      ],
    },
    {
      title: "Platform & Staff",
      links: [
        { name: "Configuration", path: "/owner/platform", icon: Sliders },
        { name: "Integrations", path: "/owner/integrations", icon: Link2 },
        { name: "Staff Management", path: "/owner/staff", icon: UserCog },
        { name: "Audit Logs", path: "/owner/audit", icon: Activity },
      ],
    },
  ];

  // Helper to find the current active link name for the breadcrumb
  let activeLinkName = "Dashboard";
  let activeSectionName = "Overview";

  sections.forEach((sec) => {
    sec.links.forEach((link) => {
      if (location.pathname.startsWith(link.path)) {
        activeLinkName = link.name;
        activeSectionName = sec.title;
      }
    });
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0B] text-foreground font-sans">
      {/* Command Palette Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
          <div className="bg-[#18181B] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CommandPalette label="Global Command Menu" className="w-full">
              <div
                className="flex items-center px-4 border-b border-white/10"
                cmdk-input-wrapper=""
              >
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <CommandPalette.Input
                  autoFocus
                  placeholder="Search headquarters..."
                  className="w-full h-14 bg-transparent border-none outline-none text-white placeholder:text-muted-foreground font-medium"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  name="hq-search"
                  type="search"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
                <div className="flex items-center gap-1">
                  <kbd className="bg-white/10 text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    ESC
                  </kbd>
                </div>
              </div>
              <CommandPalette.List className="max-h-[300px] overflow-y-auto p-2">
                <CommandPalette.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </CommandPalette.Empty>

                <CommandPalette.Group
                  heading="Navigation"
                  className="text-xs font-semibold text-muted-foreground px-2 py-2"
                >
                  {sections
                    .flatMap((s) => s.links)
                    .map((link) => (
                      <CommandPalette.Item
                        key={link.path}
                        onSelect={() => {
                          navigate(link.path);
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-md text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/10 cursor-pointer data-[selected=true]:bg-white/10 data-[selected=true]:text-white"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                      </CommandPalette.Item>
                    ))}
                </CommandPalette.Group>
              </CommandPalette.List>
            </CommandPalette>
          </div>
        </div>
      )}

      {/* Premium Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A0A0B] border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto relative z-20">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2 mt-2 group cursor-pointer">
            <img
              src="/icons/logo/kd.svg"
              alt="KodeDock"
              className="w-10 h-10 drop-shadow-md"
            />
            <div className="flex flex-col justify-center">
              <img
                src="/icons/logo/KodeDock-theme.svg"
                alt="KodeDock"
                className="h-5 w-auto mb-1.5"
              />
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Headquarters
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {section.title}
                </h3>
                <nav className="space-y-0.5">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r-full" />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isActive
                              ? "text-indigo-400"
                              : "group-hover:text-indigo-400/70",
                          )}
                        />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-8">
          <Link
            to="/owner/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-4 group",
              location.pathname === "/owner/settings"
                ? "bg-white/10 text-white"
                : "text-muted-foreground hover:bg-white/5 hover:text-white",
            )}
          >
            <Settings className="h-4 w-4 group-hover:text-white" />
            Admin Settings
          </Link>

          <div className="flex items-center gap-3 px-3 py-3 bg-[#18181B] border border-white/5 rounded-xl">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {staff?.name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {staff?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {staff?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Animation Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 border border-indigo-500/30 rounded-full animate-ping"></div>
              <div className="absolute w-16 h-16 border border-indigo-500/50 rounded-full animate-pulse"></div>
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                Securing Session
              </p>
              <p className="text-xs text-muted-foreground animate-pulse">
                Logging you out safely...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background rounded-l-[2rem] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] border-l border-white/10 relative z-30">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span>KodeDock</span>
            <span className="text-border">/</span>
            <span>{activeSectionName}</span>
            <span className="text-border">/</span>
            <span className="text-foreground">{activeLinkName}</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setOpen(true)}
              className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border px-3 py-1.5 rounded-lg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search HQ</span>
              <div className="flex items-center gap-1 ml-2">
                <kbd className="bg-background text-[10px] px-1.5 py-0.5 rounded border border-border shadow-sm">
                  ⌘
                </kbd>
                <kbd className="bg-background text-[10px] px-1.5 py-0.5 rounded border border-border shadow-sm">
                  K
                </kbd>
              </div>
            </button>

            <div className="h-5 w-[1px] bg-border hidden md:block"></div>

            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              {time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZoneName: "short",
              })}
            </div>

            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-background"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
