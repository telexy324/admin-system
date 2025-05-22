import { Role, Permission, Menu } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar?: string | null;
    status: number;
    roles: (Role & {
      permissions: Permission[];
      menus: Menu[];
    })[];
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    username: string;
    email: string;
    name: string;
    avatar?: string | null;
    status: number;
    roles: (Role & {
      permissions: Permission[];
      menus: Menu[];
    })[];
  }
} 