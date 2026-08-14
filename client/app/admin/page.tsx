"use client";
import Link from "next/link"; import { useGuard } from "@/lib/use-guard";
export default function AdminHome(){const {loading}=useGuard("admin");if(loading)return <p>Checking permissions…</p>;return <section className="card"><h1>Administrator dashboard</h1><p>Manage your collection zones and their Monday–Saturday collection entries.</p><p><Link href="/admin/zones">View zones</Link> · <Link href="/admin/schedules">Manage schedules</Link></p></section>}
