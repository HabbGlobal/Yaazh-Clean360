import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import yaazhLogo from "../assets/logo yaazh.png";
import AuthNav from "@/components/auth/AuthNav";
export const metadata = { title: "Yaazh Clean360", description: "Smart waste collection schedules" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><header><Link href="/" className="brand"><Image className="brand-logo" src={yaazhLogo} alt="Yaazh Clean360" priority /></Link><AuthNav /></header><main>{children}</main></body></html>; }
