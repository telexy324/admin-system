import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function signJWT(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(new TextEncoder().encode(JWT_SECRET));
  return token;
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub as string },
    include: {
      roles: {
        include: {
          permissions: true,
          menus: true,
        },
      },
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("未授权访问");
  }
  return user;
}

export async function hasPermission(permissionCode: string) {
  const user = await getCurrentUser();
  if (!user) return false;

  return user.roles.some((role) =>
    role.permissions.some((permission) => permission.code === permissionCode)
  );
}

// 扩展 next-auth 的类型定义
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    role: {
      id: number;
      name: string;
      permissions: {
        id: number;
        name: string;
        code: string;
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
    role: {
      id: number;
      name: string;
      permissions: {
        id: number;
        name: string;
        code: string;
      }[];
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
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
                menus: true
              }
            }
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.role.permissions.map(p => p.code),
          menus: user.role.menus.map(m => m.path)
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.menus = user.menus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.menus = token.menus;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("next-auth.session-token");
  
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken: token.value },
    include: {
      user: {
        include: {
          role: {
            include: {
              permissions: true,
              menus: true
            }
          }
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.user.id.toString(),
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      permissions: session.user.role.permissions.map((p: { code: string }) => p.code),
      menus: session.user.role.menus.map((m: { path: string }) => m.path)
    }
  };
} 