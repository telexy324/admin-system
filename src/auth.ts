import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

const prisma = new PrismaClient();

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: {
      id: number;
      name: string;
      permissions: {
        id: number;
        name: string;
      }[];
      menus: {
        id: number;
        name: string;
        path: string;
      }[];
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    name: string;
    role: {
      id: number;
      name: string;
      permissions: {
        id: number;
        name: string;
      }[];
      menus: {
        id: number;
        name: string;
        path: string;
      }[];
    };
  }
}

export const { auth, signIn, signOut } = NextAuth(authConfig);

export const {
  handlers: { GET, POST },
  auth: authHandler,
  signIn: signInHandler,
  signOut: signOutHandler,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            role: {
              include: {
                permissions: true,
                menus: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
}); 