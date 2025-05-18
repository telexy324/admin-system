import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 获取假期类型列表
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

    const [total, types] = await Promise.all([
      prisma.leaveType.count({ where }),
      prisma.leaveType.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        items: types,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("获取假期类型列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取假期类型列表失败", data: null },
      { status: 500 }
    );
  }
}

// 创建假期类型
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
    const { name, description, days, status } = data;

    // 检查类型名是否已存在
    const existingType = await prisma.leaveType.findUnique({
      where: { name },
    });

    if (existingType) {
      return NextResponse.json(
        { code: 400, message: "假期类型名称已存在", data: null },
        { status: 400 }
      );
    }

    const type = await prisma.leaveType.create({
      data: {
        name,
        description,
        days,
        status: status || 1,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: type,
    });
  } catch (error) {
    console.error("创建假期类型失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建假期类型失败", data: null },
      { status: 500 }
    );
  }
}

// 更新假期类型
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
    const { id, name, description, days, status } = data;

    // 检查类型名是否已存在（排除当前类型）
    if (name) {
      const existingType = await prisma.leaveType.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (existingType) {
        return NextResponse.json(
          { code: 400, message: "假期类型名称已存在", data: null },
          { status: 400 }
        );
      }
    }

    const type = await prisma.leaveType.update({
      where: { id },
      data: {
        name,
        description,
        days,
        status,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: type,
    });
  } catch (error) {
    console.error("更新假期类型失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新假期类型失败", data: null },
      { status: 500 }
    );
  }
}

// 删除假期类型
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
        { code: 400, message: "假期类型ID不能为空", data: null },
        { status: 400 }
      );
    }

    // 检查是否有假期申请使用该类型
    const leavesWithType = await prisma.leave.findFirst({
      where: { typeId: id },
    });

    if (leavesWithType) {
      return NextResponse.json(
        { code: 400, message: "该假期类型已被使用，无法删除", data: null },
        { status: 400 }
      );
    }

    await prisma.leaveType.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error("删除假期类型失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除假期类型失败", data: null },
      { status: 500 }
    );
  }
} 