import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 获取用户列表
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
            { username: { contains: search } },
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      hasMore: skip + users.length < total,
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { error: "获取用户列表失败" },
      { status: 500 }
    );
  }
}

// 创建用户
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const user = await prisma.user.create({
      data: {
        ...data,
        role: {
          connect: {
            id: data.roleId,
          },
        },
      },
      include: {
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("创建用户失败:", error);
    return NextResponse.json(
      { error: "创建用户失败" },
      { status: 500 }
    );
  }
}

// 更新用户
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证用户数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "用户更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新用户失败" },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除用户
    
    return NextResponse.json({
      message: "用户删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
} 