import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 获取菜单列表
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { path: { contains: search } },
          ],
        }
      : {};

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: true,
          children: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.menu.count({ where }),
    ]);

    return NextResponse.json({
      menus,
      total,
      hasMore: skip + menus.length < total,
    });
  } catch (error) {
    console.error("获取菜单列表失败:", error);
    return NextResponse.json(
      { error: "获取菜单列表失败" },
      { status: 500 }
    );
  }
}

// 创建菜单
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon,
        sort: data.sort || 0,
        parent: data.parentId
          ? {
              connect: {
                id: data.parentId,
              },
            }
          : undefined,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("创建菜单失败:", error);
    return NextResponse.json(
      { error: "创建菜单失败" },
      { status: 500 }
    );
  }
}

// 更新菜单
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const menu = await prisma.menu.update({
      where: { id: data.id },
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon,
        sort: data.sort || 0,
        parent: data.parentId
          ? {
              connect: {
                id: data.parentId,
              },
            }
          : {
              disconnect: true,
            },
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("更新菜单失败:", error);
    return NextResponse.json(
      { error: "更新菜单失败" },
      { status: 500 }
    );
  }
}

// 删除菜单
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    // 检查是否有子菜单
    const children = await prisma.menu.findMany({
      where: { parentId: id },
    });

    if (children.length > 0) {
      return NextResponse.json(
        { error: "请先删除子菜单" },
        { status: 400 }
      );
    }

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ message: "菜单删除成功" });
  } catch (error) {
    console.error("删除菜单失败:", error);
    return NextResponse.json(
      { error: "删除菜单失败" },
      { status: 500 }
    );
  }
} 