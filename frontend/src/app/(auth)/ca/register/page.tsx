"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to the unified register page with CA tab
export default function CARegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/register?tab=ca");
  }, []);
  return null;
}
