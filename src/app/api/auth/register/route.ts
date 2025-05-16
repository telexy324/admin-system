import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证用户名和密码
    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已存在" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: username,
        password: hashedPassword,
        name: username,
        role: "USER",
      },
    });

    // 生成 JWT token
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key"));

    // 创建响应
    const response = NextResponse.json({
      message: "注册成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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