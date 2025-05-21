import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';
import { idParamsSchema, LeaveDto, LeaveQueryDto, RequestStatus } from "@/types/dtos";
import { isAfter } from 'date-fns';
import { auth } from "@/auth";
import { parseDateTimeString } from "@/lib/utils";
import { Prisma } from '@prisma/client'
import { paginate } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const { type, status, startDate, endDate, page, pageSize } = await parseRequest(request, LeaveQueryDto);

    const where: Prisma.LeaveWhereInput = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (startDate && endDate) {
      where.NOT = [
        {
          endDate: {
            lt: new Date(startDate),
          },
        },
        {
          startDate: {
            gt: new Date(endDate),
          },
        },
      ]
    }

    return createResponse(
      await paginate(prisma.leave, {
        where,
        orderBy: { updatedAt: 'desc' },
        page,
        pageSize,
      })
    )
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

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const parsed = idParamsSchema.safeParse(context.params)
    if (!parsed.success) {
      return createErrorResponse("请假记录ID不能为空");
    }
    const id = parsed.data.id

    // 检查请假记录是否存在
    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return createErrorResponse("请假记录不存在");
    }

    // 检查是否可以删除
    if (leave.status !== RequestStatus.PENDING) { // 0 表示待审批
      return createErrorResponse("已审批的请假记录不能删除");
    }

    // 删除请假记录
    await prisma.leave.delete({
      where: { id },
    });

    return createResponse();
  } catch (error) {
    return handleApiError(error);
  }
} 