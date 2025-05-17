import { Role, Permission, Menu } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role & {
      permissions: Permission[];
      menus: Menu[];
    };
    permissions: string[];
    menus: string[];
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role & {
      permissions: Permission[];
      menus: Menu[];
    };
    permissions: string[];
    menus: string[];
  }
} 