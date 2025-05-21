import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseRequest, createResponse, createErrorResponse, handleApiError } from "@/lib/api-utils";
import { LoginDto } from "@/types/dtos";
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await parseRequest(request, LoginDto);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            permissions: true,
            menus: true
          }
        }
      }
    });

    if (!user) {
      return createErrorResponse("用户不存在", 404);
    }

    // 验证密码
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return createErrorResponse("密码错误", 401);
    }

    // 生成 JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // 创建响应
    const response = createResponse({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
        roles: user.roles
      },
      token
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