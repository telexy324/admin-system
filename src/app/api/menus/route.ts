import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 获取菜单列表
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
            { path: { contains: search } },
          ],
        }
      : {};

    const [total, menus] = await Promise.all([
      prisma.menu.count({ where }),
      prisma.menu.findMany({
        where,
        include: {
          parent: true,
          children: true,
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
        items: menus,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("获取菜单列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取菜单列表失败", data: null },
      { status: 500 }
    );
  }
}

// 创建菜单
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
    const { name, path, icon, parentId } = data;

    // 检查菜单名是否已存在
    const existingMenu = await prisma.menu.findUnique({
      where: { name },
    });

    if (existingMenu) {
      return NextResponse.json(
        { code: 400, message: "菜单名已存在", data: null },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        path,
        icon,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: menu,
    });
  } catch (error) {
    console.error("创建菜单失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建菜单失败", data: null },
      { status: 500 }
    );
  }
}

// 更新菜单
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
    const { id, name, path, icon, parentId } = data;

    // 检查菜单名是否已存在（排除当前菜单）
    if (name) {
      const existingMenu = await prisma.menu.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (existingMenu) {
        return NextResponse.json(
          { code: 400, message: "菜单名已存在", data: null },
          { status: 400 }
        );
      }
    }

    // 检查是否形成循环引用
    if (parentId) {
      let currentParentId = parentId;
      while (currentParentId) {
        if (currentParentId === id) {
          return NextResponse.json(
            { code: 400, message: "不能将菜单设置为自己的子菜单", data: null },
            { status: 400 }
          );
        }
        const parent = await prisma.menu.findUnique({
          where: { id: currentParentId },
        });
        currentParentId = parent?.parentId || 0;
      }
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        path,
        icon,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: menu,
    });
  } catch (error) {
    console.error("更新菜单失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新菜单失败", data: null },
      { status: 500 }
    );
  }
}

// 删除菜单
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
        { code: 400, message: "菜单ID不能为空", data: null },
        { status: 400 }
      );
    }

    // 检查是否有子菜单
    const hasChildren = await prisma.menu.findFirst({
      where: { parentId: id },
    });

    if (hasChildren) {
      return NextResponse.json(
        { code: 400, message: "该菜单下存在子菜单，无法删除", data: null },
        { status: 400 }
      );
    }

    // 检查是否有角色使用该菜单
    const rolesWithMenu = await prisma.role.findFirst({
      where: {
        menus: {
          some: {
            id,
          },
        },
      },
    });

    if (rolesWithMenu) {
      return NextResponse.json(
        { code: 400, message: "该菜单已被角色使用，无法删除", data: null },
        { status: 400 }
      );
    }

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error("删除菜单失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除菜单失败", data: null },
      { status: 500 }
    );
  }
} 