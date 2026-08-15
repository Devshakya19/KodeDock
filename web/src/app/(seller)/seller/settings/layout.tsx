import { SettingsLayout } from "@/components/settings/layout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsLayout basePath="/seller/settings" backLink="/seller">{children}</SettingsLayout>;
}