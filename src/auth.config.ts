import type { NextAuthConfig } from "next-auth";
import type { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            roles: {
              include: {
                permissions: true,
                menus: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("用户不存在");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("密码错误");
        }

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          status: user.status,
          roles: user.roles,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".your-domain.com" : undefined
      }
    }
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
} satisfies NextAuthConfig; 