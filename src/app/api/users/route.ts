import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError, paginationSchema } from '@/lib/api-utils';

// 用户创建/更新验证模式
const userSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3, "用户名至少3个字符"),
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
  roleIds: z.array(z.number()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { page, limit, search } = await parseRequest(request, paginationSchema);

    const where = search ? {
      OR: [
        { username: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    } : {};

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          roles: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return createResponse({
      items,
      total,
      page,
      limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await parseRequest(request, userSchema);

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return createErrorResponse("用户名已存在");
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password, // 注意：实际应用中需要对密码进行加密
        roles: data.roleIds ? {
          connect: data.roleIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        roles: true,
      },
    });

    return createResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await parseRequest(request, userSchema);

    if (!data.id) {
      return createErrorResponse("用户ID不能为空");
    }

    // 检查用户名是否已被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        username: data.username,
        id: { not: data.id },
      },
    });

    if (existingUser) {
      return createErrorResponse("用户名已存在");
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        email: data.email,
        ...(data.password && { password: data.password }), // 只在提供密码时更新
        roles: data.roleIds ? {
          set: [], // 先清除现有角色
          connect: data.roleIds.map(id => ({ id })), // 再添加新角色
        } : undefined,
      },
      include: {
        roles: true,
      },
    });

    return createResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await parseRequest(request, z.object({
      id: z.string().transform(val => parseInt(val)),
    }));

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return createErrorResponse("用户不存在");
    }

    // 删除用户
    await prisma.user.delete({
      where: { id },
    });

    return createResponse(null, "用户删除成功");
  } catch (error) {
    return handleApiError(error);
  }
} 