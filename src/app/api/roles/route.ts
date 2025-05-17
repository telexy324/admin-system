import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 获取角色列表
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
            { description: { contains: search } },
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
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
      prisma.role.count({ where }),
    ]);

    return NextResponse.json({
      roles,
      total,
      hasMore: skip + roles.length < total,
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    return NextResponse.json(
      { error: "获取角色列表失败" },
      { status: 500 }
    );
  }
}

// 创建角色
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, permissions } = data;

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "角色名已存在" },
        { status: 400 }
      );
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissions.map((id: number) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("创建角色失败:", error);
    return NextResponse.json(
      { error: "创建角色失败" },
      { status: 500 }
    );
  }
}

// 更新角色
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证角色数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "角色更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新角色失败" },
      { status: 500 }
    );
  }
}

// 删除角色
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除角色
    
    return NextResponse.json({
      message: "角色删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除角色失败" },
      { status: 500 }
    );
  }
} 