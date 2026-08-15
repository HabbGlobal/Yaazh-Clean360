import "./globals.css";
import AppFrame from "@/components/common/AppFrame";
export const metadata = { title: "Yaazh Clean360", description: "Smart waste collection schedules" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><AppFrame>{children}</AppFrame></body></html>; }
