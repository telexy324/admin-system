import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/generated/prisma";
import { signJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 验证用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "密码错误" },
        { status: 401 }
      );
    }

    // 生成 token
    const token = await signJWT({
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    });

    // 设置 cookie
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "登录失败" },
      { status: 500 }
    );
  }
} 