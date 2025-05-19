import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError, paginationSchema } from '@/lib/api-utils';

// 菜单创建/更新验证模式
const menuSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "菜单名称至少2个字符"),
  path: z.string().min(1, "菜单路径不能为空"),
  icon: z.string().optional(),
  parentId: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { page, limit, search } = await parseRequest(request, paginationSchema);

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { path: { contains: search } },
      ],
    } : {};

    const [total, items] = await Promise.all([
      prisma.menu.count({ where }),
      prisma.menu.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          parent: true,
          children: true,
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
    const data = await parseRequest(request, menuSchema);

    // 检查菜单名称是否已存在
    const existingMenu = await prisma.menu.findUnique({
      where: { name: data.name },
    });

    if (existingMenu) {
      return createErrorResponse("菜单名称已存在");
    }

    // 创建菜单
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon,
        parentId: data.parentId,
      },
      include: {
        parent: true,
        children: true,
        roles: true,
      },
    });

    return createResponse(menu);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await parseRequest(request, menuSchema);

    if (!data.id) {
      return createErrorResponse("菜单ID不能为空");
    }

    // 检查菜单名称是否已被其他菜单使用
    const existingMenu = await prisma.menu.findFirst({
      where: {
        name: data.name,
        id: { not: data.id },
      },
    });

    if (existingMenu) {
      return createErrorResponse("菜单名称已存在");
    }

    // 更新菜单
    const menu = await prisma.menu.update({
      where: { id: data.id },
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon,
        parentId: data.parentId,
      },
      include: {
        parent: true,
        children: true,
        roles: true,
      },
    });

    return createResponse(menu);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await parseRequest(request, z.object({
      id: z.string().transform(val => parseInt(val)),
    }));

    // 检查菜单是否存在
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        children: true,
        roles: true,
      },
    });

    if (!menu) {
      return createErrorResponse("菜单不存在");
    }

    // 检查是否有子菜单
    if (menu.children.length > 0) {
      return createErrorResponse("该菜单下存在子菜单，无法删除");
    }

    // 检查是否有角色使用此菜单
    if (menu.roles.length > 0) {
      return createErrorResponse("该菜单已被角色使用，无法删除");
    }

    // 删除菜单
    await prisma.menu.delete({
      where: { id },
    });

    return createResponse(null, "菜单删除成功");
  } catch (error) {
    return handleApiError(error);
  }
} 