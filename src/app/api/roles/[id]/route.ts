import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

// 角色更新验证模式
const roleUpdateSchema = z.object({
  name: z.string().min(2, "角色名称至少2个字符"),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).optional(),
  menuIds: z.array(z.number()).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await parseRequest(request, roleUpdateSchema);
    const id = parseInt(params.id);

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return createErrorResponse("角色不存在");
    }

    // 检查角色名称是否已被其他角色使用
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name: data.name,
        id: { not: id },
      },
    });

    if (duplicateRole) {
      return createErrorResponse("角色名称已存在");
    }

    // 更新角色
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds ? {
          set: [], // 先清除现有权限
          connect: data.permissionIds.map(id => ({ id })), // 再添加新权限
        } : undefined,
        menus: data.menuIds ? {
          set: [], // 先清除现有菜单
          connect: data.menuIds.map(id => ({ id })), // 再添加新菜单
        } : undefined,
      },
      include: {
        permissions: true,
        menus: true,
      },
    });

    return createResponse(role);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        menus: true,
        users: true,
      },
    });

    if (!role) {
      return createErrorResponse("角色不存在");
    }

    // 检查是否有用户使用此角色
    if (role.users.length > 0) {
      return createErrorResponse("该角色下存在用户，无法删除");
    }

    // 删除角色
    await prisma.role.delete({
      where: { id },
    });

    return createResponse(null, "角色删除成功");
  } catch (error) {
    return handleApiError(error);
  }
} 