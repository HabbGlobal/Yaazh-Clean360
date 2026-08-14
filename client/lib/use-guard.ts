"use client";

import { api } from "./api";
import { clearToken } from "./auth-storage";
import type { Role, User } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useGuard(requiredRole?: Role) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then((currentUser) => {
      if (requiredRole && currentUser.role !== requiredRole) {
        router.replace("/dashboard");
        return;
      }
      setUser(currentUser);
    }).catch(() => {
      clearToken();
      router.replace("/login");
    }).finally(() => setLoading(false));
  }, [requiredRole, router]);

  return { user, loading };
}
