import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseRequest, createResponse, createErrorResponse, handleApiError } from "@/lib/api-utils";
import { RegisterDto } from "@/types/dtos";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, name } = await parseRequest(request, RegisterDto);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createErrorResponse("该邮箱已被注册");
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return createErrorResponse("该用户名已被使用");
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 查找默认用户角色
    const defaultRole = await prisma.role.findFirst({
      where: { name: "普通用户" },
    });

    if (!defaultRole) {
      return createErrorResponse("系统错误：默认角色不存在", 500);
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
    const response = createResponse({
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
    return handleApiError(error);
  }
} 