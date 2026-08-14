import { Bell, Info } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">Configure email and push alerts</p>
          </div>
        </div>

        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-1">Notification preferences are coming soon</h3>
          <p className="text-[14px] text-slate-500 max-w-md mx-auto">
            Soon you will be able to customize exactly which email and push notifications you want to receive for sales, reviews, and platform updates.
          </p>
        </div>
      </div>
    </div>
  );
}
