import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 获取菜单列表
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;
    const take = pageSize;

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
        take,
        orderBy: [
          { parentId: "asc" },
          { order: "asc" },
        ],
        include: {
          permissions: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const { name, path, icon, parentId, order, permissions } = data;

    // 检查菜单路径是否已存在
    const existingMenu = await prisma.menu.findFirst({
      where: { path },
    });

    if (existingMenu) {
      return NextResponse.json(
        { error: "菜单路径已存在" },
        { status: 400 }
      );
    }

    // 创建菜单
    const menu = await prisma.menu.create({
      data: {
        name,
        path,
        icon,
        parentId,
        order,
        permissions: {
          connect: permissions.map((id: number) => ({ id })),
        },
      },
      include: {
        permissions: true,
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
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证菜单数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "菜单更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新菜单失败" },
      { status: 500 }
    );
  }
}

// 删除菜单
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除菜单
    
    return NextResponse.json({
      message: "菜单删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除菜单失败" },
      { status: 500 }
    );
  }
} 