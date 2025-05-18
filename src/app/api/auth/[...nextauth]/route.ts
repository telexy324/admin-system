import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import type { User } from 'next-auth';

const prisma = new PrismaClient();

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('邮箱和密码不能为空');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
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
          throw new Error('用户不存在');
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('密码错误');
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
}); 