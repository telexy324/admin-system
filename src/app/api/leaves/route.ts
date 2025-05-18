import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 获取假期申请列表
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
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where = {
      AND: [
        search
          ? {
              OR: [
                { reason: { contains: search } },
                { user: { name: { contains: search } } },
              ],
            }
          : {},
        status ? { status: parseInt(status) } : {},
        userId ? { userId: parseInt(userId) } : {},
      ],
    };

    const [total, leaves] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          type: true,
          approver: {
            select: {
              id: true,
              name: true,
              username: true,
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
        items: leaves,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("获取假期申请列表失败:", error);
    return NextResponse.json(
      { code: 500, message: "获取假期申请列表失败", data: null },
      { status: 500 }
    );
  }
}

// 创建假期申请
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
    const { typeId, startDate, endDate, days, reason } = data;

    // 检查假期类型是否存在
    const type = await prisma.leaveType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      return NextResponse.json(
        { code: 400, message: "假期类型不存在", data: null },
        { status: 400 }
      );
    }

    // 检查用户是否还有足够的假期
    const year = new Date(startDate).getFullYear();
    const usedDays = await prisma.leave.aggregate({
      where: {
        userId: parseInt(session.user.id),
        typeId,
        status: 1, // 已批准的假期
        startDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      _sum: {
        days: true,
      },
    });

    const remainingDays = type.days - (usedDays._sum.days || 0);
    if (remainingDays < days) {
      return NextResponse.json(
        { code: 400, message: "剩余假期天数不足", data: null },
        { status: 400 }
      );
    }

    const leave = await prisma.leave.create({
      data: {
        userId: parseInt(session.user.id),
        typeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: 0, // 待审批
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        type: true,
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: leave,
    });
  } catch (error) {
    console.error("创建假期申请失败:", error);
    return NextResponse.json(
      { code: 500, message: "创建假期申请失败", data: null },
      { status: 500 }
    );
  }
}

// 更新假期申请（审批）
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
    const { id, status, comment } = data;

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: parseInt(session.user.id),
        approvedAt: new Date(),
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        type: true,
        approver: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: leave,
    });
  } catch (error) {
    console.error("更新假期申请失败:", error);
    return NextResponse.json(
      { code: 500, message: "更新假期申请失败", data: null },
      { status: 500 }
    );
  }
}

// 删除假期申请
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
        { code: 400, message: "假期申请ID不能为空", data: null },
        { status: 400 }
      );
    }

    // 检查是否是自己的申请
    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return NextResponse.json(
        { code: 404, message: "假期申请不存在", data: null },
        { status: 404 }
      );
    }

    if (leave.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { code: 403, message: "无权删除他人的假期申请", data: null },
        { status: 403 }
      );
    }

    // 只能删除待审批的申请
    if (leave.status !== 0) {
      return NextResponse.json(
        { code: 400, message: "只能删除待审批的假期申请", data: null },
        { status: 400 }
      );
    }

    await prisma.leave.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error("删除假期申请失败:", error);
    return NextResponse.json(
      { code: 500, message: "删除假期申请失败", data: null },
      { status: 500 }
    );
  }
} 