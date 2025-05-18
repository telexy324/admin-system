"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Menu as MenuIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '用户管理',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: '角色管理',
    href: '/dashboard/roles',
    icon: Shield,
  },
  {
    title: '菜单管理',
    href: '/dashboard/menus',
    icon: MenuIcon,
  },
  {
    title: '系统设置',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: "/login"
      });
      
      toast({
        title: "登出成功",
        description: "您已成功退出系统",
      });
      
      // 跳转到登录页
      router.push("/login");
    } catch (error) {
      console.error("登出失败:", error);
      toast({
        title: "登出失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        {!isCollapsed && <span className="ml-2 text-lg font-semibold">管理系统</span>}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                isCollapsed ? "px-2" : "px-4"
              )}
              onClick={() => router.push(item.href)}
            >
              <span className="flex items-center">
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-2">{item.title}</span>}
              </span>
            </Button>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-2">退出登录</span>}
        </Button>
      </div>
    </div>
  );
} 