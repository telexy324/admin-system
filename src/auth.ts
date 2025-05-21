import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/auth.config";

const prisma = new PrismaClient();

// declare module "next-auth" {
//   interface User {
//     id: string;
//     username: string;
//     email: string;
//     name: string;
//     avatar?: string | null;
//     status: number;
//     roles: (Role & {
//       permissions: Permission[];
//       menus: Menu[];
//     })[];
//   }
//
//   interface Session {
//     user: User;
//   }
// }
//
// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     username: string;
//     email: string;
//     name: string;
//     avatar?: string | null;
//     status: number;
//     roles: (Role & {
//       permissions: Permission[];
//       menus: Menu[];
//     })[];
//   }
// }

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.status = user.status;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
  ...authConfig
}); 