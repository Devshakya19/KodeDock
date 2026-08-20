import { LandingNavbar } from "./landing-navbar";
import { AppNavbar } from "./app-navbar";

export interface NavbarProps {
  variant?: "landing" | "browse" | "dashboard" | "seller";
  email?: string;
  fullName?: string;
  searchQuery?: string;
}

export function Navbar(props: NavbarProps) {
  if (!props.variant || props.variant === "landing") {
    return <LandingNavbar />;
  }
  
  return (
    <AppNavbar 
      variant={props.variant} 
      email={props.email}
      fullName={props.fullName}
      searchQuery={props.searchQuery}
    />
  );
}
