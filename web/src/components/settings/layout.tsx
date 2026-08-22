"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, CreditCard, Bell, ArrowLeft, Link as LinkIcon, Palette } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
  basePath: string;
  backLink: string;
}

export function SettingsLayout({ children, basePath, backLink }: SettingsLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Profile",
      href: `${basePath}/profile`,
      icon: User,
      description: "Manage how you appear to others",
    },
    {
      name: "Security & Password",
      href: `${basePath}/security`,
      icon: Shield,
      description: "Update your password and secure your account",
    },
    {
      name: "Payout Details",
      href: `${basePath}/payouts`,
      icon: CreditCard,
      description: "Manage your bank accounts and withdrawals",
    },
    {
      name: "Connected Accounts",
      href: `${basePath}/connections`,
      icon: LinkIcon,
      description: "Link GitHub, Google, and other services",
    },
    {
      name: "Notifications",
      href: `${basePath}/notifications`,
      icon: Bell,
      description: "Configure email and push alerts",
    },
    {
      name: "Appearance",
      href: `${basePath}/appearance`,
      icon: Palette,
      description: "Customize your theme and display",
    },
  ];

  return (
    <div className="w-full pb-12 pt-4">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href={backLink} className="inline-flex items-center gap-2 text-[13px] font-bold text-muted-foreground hover:text-foreground mb-5 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">Account Settings</h1>
          <p className="text-muted-foreground font-medium text-[15px]">Manage your profile, security, and preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
        {/* Sidebar Navigation */}
        <nav className="flex-shrink-0 w-full lg:w-72 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icon className="w-24 h-24 -rotate-12 translate-x-8 -translate-y-8" />
                  </div>
                )}
                
                <div className={`relative z-10 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "bg-white/20 text-primary-foreground backdrop-blur-md border border-border/20" : "bg-secondary text-muted-foreground group-hover:bg-background group-hover:shadow-sm"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="relative z-10">
                  <h3 className={`text-[15px] font-bold ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                    {item.name}
                  </h3>
                  <p className={`text-[13px] font-medium mt-0.5 leading-snug ${isActive ? "text-muted-foreground/80" : "text-muted-foreground"}`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          <div className="max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
