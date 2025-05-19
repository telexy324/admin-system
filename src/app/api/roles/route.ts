import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 获取角色列表
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { code: 401, message: "未授权", data: null },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const [total, roles] = await Promise.all([
      prisma.role.count({ where }),
      prisma.role.findMany({
        where,
        include: {
          permissions: true,
          menus: true,
          users: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        items: roles,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取角色列表失败", data: null },
      { status: 500 }
    );
  }
}

// 创建角色
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { code: 401, message: "未授权", data: null },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, description, permissionIds, menuIds, userIds } = data;

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { code: 400, message: "角色名已存在", data: null },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissionIds?.map((id: number) => ({ id })) || [],
        },
        menus: {
          connect: menuIds?.map((id: number) => ({ id })) || [],
        },
        users: {
          connect: userIds?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
        menus: true,
        users: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: role,
    });
  } catch (error) {
    console.error("创建角色失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建角色失败", data: null },
      { status: 500 }
    );
  }
}

// 更新角色
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { code: 401, message: "未授权", data: null },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, name, description, permissionIds, menuIds, userIds } = data;

    // 检查角色名是否已存在（排除当前角色）
    if (name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (existingRole) {
        return NextResponse.json(
          { code: 400, message: "角色名已存在", data: null },
          { status: 400 }
        );
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: {
          set: permissionIds?.map((id: number) => ({ id })) || [],
        },
        menus: {
          set: menuIds?.map((id: number) => ({ id })) || [],
        },
        users: {
          set: userIds?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
        menus: true,
        users: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: role,
    });
  } catch (error) {
    console.error("更新角色失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新角色失败", data: null },
      { status: 500 }
    );
  }
}

// 删除角色
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { code: 401, message: "未授权", data: null },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { code: 400, message: "角色ID不能为空", data: null },
        { status: 400 }
      );
    }

    // 检查是否有用户使用该角色
    const usersWithRole = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            id: id
          }
        }
      }
    });

    if (usersWithRole) {
      return NextResponse.json(
        { code: 400, message: "该角色下存在用户，无法删除", data: null },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error("删除角色失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除角色失败", data: null },
      { status: 500 }
    );
  }
} 