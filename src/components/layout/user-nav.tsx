"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        onClick={handleLogout}
      >
        退出登录
      </Button>
    </div>
  );
} 