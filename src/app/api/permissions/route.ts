import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError, paginationSchema } from '@/lib/api-utils';

// 权限创建/更新验证模式
const permissionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "权限名称至少2个字符"),
  description: z.string().optional(),
  path: z.string().min(1, "API路径不能为空"),
  method: z.string().min(1, "HTTP方法不能为空"),
});

export async function GET(request: NextRequest) {
  try {
    const { page, limit, search } = await parseRequest(request, paginationSchema);

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { path: { contains: search } },
      ],
    } : {};

    const [total, items] = await Promise.all([
      prisma.permission.count({ where }),
      prisma.permission.findMany({
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
    const data = await parseRequest(request, permissionSchema);

    // 检查权限是否已存在
    const existingPermission = await prisma.permission.findFirst({
      where: {
        path: data.path,
        method: data.method,
      },
    });

    if (existingPermission) {
      return createErrorResponse("该API路径和方法组合已存在");
    }

    // 创建权限
    const permission = await prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
        path: data.path,
        method: data.method,
      },
      include: {
        roles: true,
      },
    });

    return createResponse(permission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await parseRequest(request, permissionSchema);

    if (!data.id) {
      return createErrorResponse("权限ID不能为空");
    }

    // 检查权限是否已被其他权限使用
    const existingPermission = await prisma.permission.findFirst({
      where: {
        path: data.path,
        method: data.method,
        id: { not: data.id },
      },
    });

    if (existingPermission) {
      return createErrorResponse("该API路径和方法组合已存在");
    }

    // 更新权限
    const permission = await prisma.permission.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        path: data.path,
        method: data.method,
      },
      include: {
        roles: true,
      },
    });

    return createResponse(permission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await parseRequest(request, z.object({
      id: z.string().transform(val => parseInt(val)),
    }));

    // 检查权限是否存在
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      return createErrorResponse("权限不存在");
    }

    // 检查是否有角色使用此权限
    if (permission.roles.length > 0) {
      return createErrorResponse("该权限已被角色使用，无法删除");
    }

    // 删除权限
    await prisma.permission.delete({
      where: { id },
    });

    return createResponse(null, "权限删除成功");
  } catch (error) {
    return handleApiError(error);
  }
} 