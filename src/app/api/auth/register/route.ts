import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

// 创建全局 Prisma 客户端实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username, name } = body;

    // 验证必填字段
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "邮箱、用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "该用户名已被使用" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 查找默认用户角色
    const defaultRole = await prisma.role.findFirst({
      where: { name: "普通用户" },
    });

    if (!defaultRole) {
      return NextResponse.json(
        { error: "系统错误：默认角色不存在" },
        { status: 500 }
      );
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: name || username,
        status: 1, // 1: 正常
        roles: {
          connect: {
            id: defaultRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            permissions: true,
            menus: true,
          },
        },
      },
    });

    // 生成 JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      roles: user.roles,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key"));

    // 创建响应
    const response = NextResponse.json({
      message: "注册成功",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
        roles: user.roles,
      },
    });

    // 设置 cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
} 