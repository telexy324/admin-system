import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 获取权限列表
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

    const [total, permissions] = await Promise.all([
      prisma.permission.count({ where }),
      prisma.permission.findMany({
        where,
        include: {
          roles: true,
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
        items: permissions,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("获取权限列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取权限列表失败", data: null },
      { status: 500 }
    );
  }
}

// 创建权限
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
    const { name, description } = data;

    // 检查权限名是否已存在
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      return NextResponse.json(
        { code: 400, message: "权限名已存在", data: null },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: permission,
    });
  } catch (error) {
    console.error("创建权限失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建权限失败", data: null },
      { status: 500 }
    );
  }
}

// 更新权限
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
    const { id, name, description } = data;

    // 检查权限名是否已存在（排除当前权限）
    if (name) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (existingPermission) {
        return NextResponse.json(
          { code: 400, message: "权限名已存在", data: null },
          { status: 400 }
        );
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: permission,
    });
  } catch (error) {
    console.error("更新权限失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新权限失败", data: null },
      { status: 500 }
    );
  }
}

// 删除权限
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
        { code: 400, message: "权限ID不能为空", data: null },
        { status: 400 }
      );
    }

    // 检查是否有角色使用该权限
    const rolesWithPermission = await prisma.role.findFirst({
      where: {
        permissions: {
          some: {
            id,
          },
        },
      },
    });

    if (rolesWithPermission) {
      return NextResponse.json(
        { code: 400, message: "该权限已被角色使用，无法删除", data: null },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error("删除权限失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除权限失败", data: null },
      { status: 500 }
    );
  }
} 