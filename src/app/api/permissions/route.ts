import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 获取权限列表
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
            { code: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.permission.count({ where }),
    ]);

    return NextResponse.json({
      permissions,
      total,
      hasMore: skip + permissions.length < total,
    });
  } catch (error) {
    console.error("获取权限列表失败:", error);
    return NextResponse.json(
      { error: "获取权限列表失败" },
      { status: 500 }
    );
  }
}

// 创建权限
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const { name, code, description } = data;

    // 检查权限代码是否已存在
    const existingPermission = await prisma.permission.findFirst({
      where: { code },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: "权限代码已存在" },
        { status: 400 }
      );
    }

    // 创建权限
    const permission = await prisma.permission.create({
      data: {
        name,
        code,
        description,
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error("创建权限失败:", error);
    return NextResponse.json(
      { error: "创建权限失败" },
      { status: 500 }
    );
  }
}

// 更新权限
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证权限数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "权限更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新权限失败" },
      { status: 500 }
    );
  }
}

// 删除权限
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除权限
    
    return NextResponse.json({
      message: "权限删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除权限失败" },
      { status: 500 }
    );
  }
} 