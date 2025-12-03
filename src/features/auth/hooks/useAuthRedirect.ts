"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { getRoleBasedRedirect } from "@/lib/role";

export function useAuthRedirect() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl");
  const hasRedirected = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasRedirected.current) {
      hasRedirected.current = true;
      const role = (session.user as { role: string }).role;
      const redirectUrl = callbackUrl || getRoleBasedRedirect(role);
      window.location.href = redirectUrl;
    }
  }, [status, session, callbackUrl]);

  const handleSuccessfulLogin = async () => {
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    // Wait a bit for session to be established
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Get session to determine role
    const response = await fetch("/api/auth/session");
    const sessionData = await response.json();

    if (sessionData?.user?.role) {
      const role = sessionData.user.role;
      const redirectUrl = callbackUrl || getRoleBasedRedirect(role);

      // Use window.location for reliable redirect
      window.location.href = redirectUrl;
    } else {
      // Fallback if role not found
      window.location.href = callbackUrl || "/menu";
    }
  };

  return {
    status,
    hasRedirected: hasRedirected.current,
    handleSuccessfulLogin,
  };
}
