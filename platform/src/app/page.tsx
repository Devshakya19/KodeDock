import { redirect } from "next/navigation";

export default function PlatformRootPage() {
  // Redirect the user to the auth module by default
  redirect("/login");
}
