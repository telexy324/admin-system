export { GET, POST } from "@/auth";

// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";
// import { User } from "@prisma/client";
//
// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "用户名", type: "text" },
//         password: { label: "密码", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) {
//           throw new Error("请输入用户名和密码");
//         }
//
//         try {
//           const user = await prisma.user.findUnique({
//             where: { username: credentials.username as string },
//             include: {
//               roles: {
//                 include: {
//                   permissions: true,
//                   menus: true
//                 }
//               }
//             }
//           });
//
//           if (!user) {
//             throw new Error("用户不存在");
//           }
//
//           const isValid = await bcrypt.compare(credentials.password as string, user.password);
//           if (!isValid) {
//             throw new Error("密码错误");
//           }
//
//           return {
//             ...user,
//             id: user.id.toString(),
//             roles: user.roles.map(role => ({
//               ...role,
//               id: role.id,
//               permissions: role.permissions.map(permission => ({
//                 ...permission,
//                 id: permission.id
//               })),
//               menus: role.menus.map(menu => ({
//                 ...menu,
//                 id: menu.id
//               }))
//             }))
//           };
//         } catch (error) {
//           console.error("登录验证失败:", error);
//           throw error;
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   callbacks: {
//     async jwt({ token, user }: { token: any; user: any }) {
//       if (user) {
//         token.id = user.id;
//         token.username = user.username;
//         token.role = user.roles[0]; // 假设用户只有一个角色
//       }
//       return token;
//     },
//     async session({ session, token }: { session: any; token: any }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.username = token.username;
//         session.user.role = token.role;
//       }
//       return session;
//     }
//   },
//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },
//   cookies: {
//     sessionToken: {
//       name: "next-auth.session-token",
//       options: {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//         secure: process.env.NODE_ENV === "production",
//         domain: process.env.NODE_ENV === "production" ? ".your-domain.com" : undefined
//       }
//     }
//   },
//   secret: process.env.JWT_SECRET,
//   debug: process.env.NODE_ENV === "development"
// };