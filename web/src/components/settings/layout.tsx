"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, CreditCard, Bell, ArrowLeft, Link as LinkIcon } from "lucide-react";

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
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={backLink} className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Manage your profile, security, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="flex-shrink-0 w-full lg:w-72 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100" 
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-[15px] font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                    {item.name}
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
