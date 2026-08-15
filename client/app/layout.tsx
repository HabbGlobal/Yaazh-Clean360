import "./globals.css";
import CallPopup from "@/components/common/CallPopup";
import SiteHeader from "@/components/common/SiteHeader";
export const metadata = { title: "Yaazh Clean360", description: "Smart waste collection schedules" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><SiteHeader /><main>{children}</main><CallPopup /></body></html>; }
