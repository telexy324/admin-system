import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError, paginationSchema } from '@/lib/api-utils';
import { idParamsSchema, LeaveDto, RequestStatus } from "@/types/dtos";
import { isAfter } from 'date-fns';
import { auth } from "@/auth";
import { parseDateTimeString } from "@/lib/utils";

// 请假创建/更新验证模式
// const leaveSchema = z.object({
//   id: z.number().optional(),
//   userId: z.number(),
//   typeId: z.number(),
//   startDate: z.string().transform(str => new Date(str)),
//   endDate: z.string().transform(str => new Date(str)),
//   days: z.number(),
//   reason: z.string().min(2, "请假原因至少2个字符"),
//   status: z.number().default(0),
//   approvedBy: z.number().optional(),
//   approvedAt: z.string().transform(str => new Date(str)).optional(),
//   comment: z.string().optional(),
// });

export async function GET(request: NextRequest) {
  try {
    const { page, limit, search } = await parseRequest(request, paginationSchema);

    const where = search ? {
      OR: [
        { reason: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { username: { contains: search } } },
      ],
    } : {};

    const [total, items] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          approver: true,
          type: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return createResponse({
      items,
      total,
      page,
      limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    const data = await parseRequest(request, LeaveDto);

    if (isAfter(parseDateTimeString(data.startDate), parseDateTimeString(data.endDate))) {
      return createErrorResponse("开始时间必须早于结束时间");
    }

    // 检查是否有重叠的请假记录
    const overlappingLeave = await prisma.leave.findFirst({
      where: {
        userId,
        status: { notIn: [RequestStatus.CANCELLED, RequestStatus.REJECTED] }, // 2 表示已拒绝
        OR: [
          {
            startDate: { lte: parseDateTimeString(data.startDate) },
            endDate: { gt: parseDateTimeString(data.startDate) },
          },
          {
            startDate: { lt: parseDateTimeString(data.endDate) },
            endDate: { gte: parseDateTimeString(data.endDate) },
          },
        ],
      },
    });

    if (overlappingLeave) {
      return createErrorResponse("该时间段内已有请假记录");
    }

    // 创建请假记录
    await prisma.leave.create({
      data: {
        userId,
        type: data.type,
        startDate: parseDateTimeString(data.startDate),
        endDate: parseDateTimeString(data.endDate),
        amount: data.amount,
        reason: data.reason,
        status: RequestStatus.PENDING,
        proof: {
          connect: data.proof
            ? data.proof.map(id => ({ id }))
            : undefined, // 空数组就不连接
        },
      },
    });

    return createResponse();
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    const data = await parseRequest(request, LeaveDto);

    const parsed = idParamsSchema.safeParse(context.params)
    if (!parsed.success) {
      return createErrorResponse("请假记录ID不能为空");
    }
    const id = parsed.data.id
    // 检查请假记录是否存在
    const existingLeave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!existingLeave) {
      return createErrorResponse("请假记录不存在");
    }

    // 检查是否可以修改
    if (existingLeave.status !== RequestStatus.PENDING) {
      return createErrorResponse("已审批的请假记录不能修改");
    }

    // 检查时间是否合法
    if (isAfter(parseDateTimeString(data.startDate), parseDateTimeString(data.endDate))) {
      return createErrorResponse("开始时间必须早于结束时间");
    }

    // 检查是否有重叠的请假记录
    const overlappingLeave = await prisma.leave.findFirst({
      where: {
        userId,
        status: { notIn: [RequestStatus.CANCELLED, RequestStatus.REJECTED] }, // 2 表示已拒绝
        OR: [
          {
            startDate: { lte: parseDateTimeString(data.startDate) },
            endDate: { gt: parseDateTimeString(data.startDate) },
          },
          {
            startDate: { lt: parseDateTimeString(data.endDate) },
            endDate: { gte: parseDateTimeString(data.endDate) },
          },
        ],
      },
    });

    if (overlappingLeave) {
      return createErrorResponse("该时间段内已有请假记录");
    }

    // 更新请假记录
    await prisma.leave.update({
      where: { id },
      data: {
        type: data.type,
        startDate: parseDateTimeString(data.startDate),
        endDate: parseDateTimeString(data.endDate),
        amount: data.amount,
        reason: data.reason,
        proof: {
          set: [],
          connect: data.proof
            ? data.proof.map(id => ({ id }))
            : undefined, // 空数组就不连接
        },
      },
    });

    return createResponse();
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await parseRequest(request, z.object({
      id: z.string().transform(val => parseInt(val)),
    }));

    // 检查请假记录是否存在
    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return createErrorResponse("请假记录不存在");
    }

    // 检查是否可以删除
    if (leave.status !== 0) { // 0 表示待审批
      return createErrorResponse("已审批的请假记录不能删除");
    }

    // 删除请假记录
    await prisma.leave.delete({
      where: { id },
    });

    return createResponse(null, "请假记录删除成功");
  } catch (error) {
    return handleApiError(error);
  }
} 