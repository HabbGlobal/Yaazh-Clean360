import "./globals.css";
import AppFrame from "@/components/common/AppFrame";
import favicon from "@/assets/favicon.jpg";
export const metadata = { title: "Yaazh Clean360", description: "Smart waste collection schedules", icons: { icon: favicon.src } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><AppFrame>{children}</AppFrame></body></html>; }
