"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);
  if (isLoading) {
    return <LoadingSpinner size="lg" color="blue" text="Memeriksa autentikasi..." fullScreen />;
  }
  if (isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}

