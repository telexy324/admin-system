import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "仪表盘",
    href: "/dashboard",
  },
  {
    title: "用户管理",
    href: "/users",
  },
  {
    title: "角色管理",
    href: "/roles",
  },
  {
    title: "权限管理",
    href: "/permissions",
  },
  {
    title: "菜单管理",
    href: "/menus",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
} 