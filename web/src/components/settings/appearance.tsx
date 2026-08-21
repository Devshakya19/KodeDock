"use client";

import { useEffect, useState } from "react";
import { Palette, Check, Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { theme } from "@/shared/lib/theme";

export function AppearanceSettings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={theme.components.card}>
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Appearance</h2>
            <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Customize the look and feel of your dashboard</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[15px] font-bold text-foreground mb-4">Theme Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Light Mode Option */}
               <ThemeOption 
                  name="Light Mode" 
                  value="light" 
                  icon={<Sun className="w-4 h-4 text-slate-500" />}
                  currentTheme={currentTheme} 
                  onClick={() => setTheme("light")} 
                  previewBg="bg-slate-50"
                  mockupBody="bg-white"
                  mockupBorder="border-slate-200"
                  mockupText="bg-slate-200"
               />
               
               {/* Dark Mode Option */}
               <ThemeOption 
                  name="Dark Mode" 
                  value="dark" 
                  icon={<Moon className="w-4 h-4 text-slate-400" />}
                  currentTheme={currentTheme} 
                  onClick={() => setTheme("dark")} 
                  previewBg="bg-slate-950"
                  mockupBody="bg-slate-900"
                  mockupBorder="border-slate-800"
                  mockupText="bg-slate-700"
               />
               
               {/* System Mode Option */}
               <ThemeOption 
                  name="System Mode" 
                  value="system" 
                  icon={<Monitor className="w-4 h-4 text-slate-400" />}
                  currentTheme={currentTheme} 
                  onClick={() => setTheme("system")} 
                  previewBg="bg-gradient-to-r from-slate-50 to-slate-950"
                  mockupBody="bg-gradient-to-r from-white to-slate-900"
                  mockupBorder="border-slate-200 dark:border-slate-800"
                  mockupText="bg-slate-300 dark:bg-slate-700"
               />
            </div>
            
            <p className="text-[13px] text-muted-foreground mt-4 font-medium">
              Choose "System Mode" if you want your dashboard to automatically switch based on your operating system settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThemeOptionProps {
  name: string;
  value: string;
  icon: React.ReactNode;
  currentTheme?: string;
  onClick: () => void;
  previewBg: string;
  mockupBody: string;
  mockupBorder: string;
  mockupText: string;
}

function ThemeOption({ name, value, icon, currentTheme, onClick, previewBg, mockupBody, mockupBorder, mockupText }: ThemeOptionProps) {
  const isActive = currentTheme === value;
  
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border-2 p-1.5 transition-all ${
        isActive 
          ? "border-accent shadow-sm" 
          : "border-transparent hover:border-slate-200 dark:hover:border-slate-800"
      }`}
    >
      <div className={`w-full h-28 rounded-xl ${previewBg} flex flex-col justify-between p-3 border ${isActive ? "border-transparent" : "border-border"} shadow-sm overflow-hidden`}>
        {/* Abstract Mockup Header */}
        <div className="flex gap-2">
            <div className={`w-6 h-2.5 rounded-full ${mockupText} opacity-80`} />
            <div className={`w-12 h-2.5 rounded-full ${mockupText} opacity-80`} />
        </div>
        {/* Abstract Mockup Body */}
        <div className={`w-full h-12 rounded-lg ${mockupBody} border ${mockupBorder} p-2 flex flex-col gap-1.5`}>
            <div className={`w-full h-1.5 rounded-full ${mockupText} opacity-60`} />
            <div className={`w-4/5 h-1.5 rounded-full ${mockupText} opacity-60`} />
            <div className={`w-2/5 h-1.5 rounded-full ${mockupText} opacity-60`} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 mb-1 px-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`text-[14px] font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
            {name}
          </span>
        </div>
        {isActive && (
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-primary-foreground">
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}
