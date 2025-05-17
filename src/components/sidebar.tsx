"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Menu as MenuIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "仪表板",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "用户管理",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "角色管理",
    href: "/dashboard/roles",
    icon: Shield,
  },
  {
    title: "菜单管理",
    href: "/dashboard/menus",
    icon: MenuIcon,
  },
  {
    title: "系统设置",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-semibold">管理系统</span>
        </Link>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* 底部用户信息和退出按钮 */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          onClick={() => {
            // TODO: 实现退出登录
          }}
        >
          <LogOut className="h-5 w-5" />
          退出登录
        </Button>
      </div>
    </div>
  );
} 