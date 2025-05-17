import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 获取角色列表
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
            { description: { contains: search } },
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          permissions: true,
          menus: true,
        },
        orderBy: {
          createdAt: "desc",
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissionIds?.map((id: number) => ({ id })) || [],
        },
        menus: {
          connect: data.menuIds?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
        menus: true,
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();
    const role = await prisma.role.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          set: data.permissionIds?.map((id: number) => ({ id })) || [],
        },
        menus: {
          set: data.menuIds?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
        menus: true,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("更新角色失败:", error);
    return NextResponse.json(
      { error: "更新角色失败" },
      { status: 500 }
    );
  }
}

// 删除角色
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ message: "角色删除成功" });
  } catch (error) {
    console.error("删除角色失败:", error);
    return NextResponse.json(
      { error: "删除角色失败" },
      { status: 500 }
    );
  }
} 