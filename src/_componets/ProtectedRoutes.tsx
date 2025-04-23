"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/lib/hooks/useAuth";

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/get-session`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Session check failed", error);
        router.push("/sign-in");
      }
    };

    checkSession();
  }, [pathname]);

  if (!isLoggedIn) return <div>Loading...</div>;

  return <>{children}</>;
}
export default ProtectedRoutes;
