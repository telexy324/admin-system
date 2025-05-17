import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 获取用户列表
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
    const roleId = searchParams.get("roleId");

    const where = {
      AND: [
        search
          ? {
              OR: [
                { username: { contains: search } },
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {},
        roleId ? { roleId: parseInt(roleId) } : {},
      ],
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          role: {
            include: {
              permissions: true,
              menus: true,
            },
          },
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
        items: users,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取用户列表失败", data: null },
      { status: 500 }
    );
  }
}

// 创建用户
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
    const { username, password, email, name, roleId, avatar, status } = data;

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { code: 400, message: "用户名已存在", data: null },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { code: 400, message: "邮箱已存在", data: null },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        username,
        password, // 注意：实际应用中应该对密码进行加密
        email,
        name,
        roleId,
        avatar,
        status: status || 1,
      },
      include: {
        role: {
          include: {
            permissions: true,
            menus: true,
          },
        },
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: user,
    });
  } catch (error) {
    console.error("创建用户失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建用户失败", data: null },
      { status: 500 }
    );
  }
}

// 更新用户
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
    const { id, username, email, name, roleId, avatar, status } = data;

    // 检查用户名是否已存在（排除当前用户）
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { code: 400, message: "用户名已存在", data: null },
          { status: 400 }
        );
      }
    }

    // 检查邮箱是否已存在（排除当前用户）
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { code: 400, message: "邮箱已存在", data: null },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        name,
        roleId,
        avatar,
        status,
      },
      include: {
        role: {
          include: {
            permissions: true,
            menus: true,
          },
        },
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: user,
    });
  } catch (error) {
    console.error("更新用户失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新用户失败", data: null },
      { status: 500 }
    );
  }
}

// 删除用户
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
        { code: 400, message: "用户ID不能为空", data: null },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error("删除用户失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除用户失败", data: null },
      { status: 500 }
    );
  }
} 