import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseRequest, createResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';
import { idParamsSchema, LeaveDto, LeaveQueryDto, RequestStatus } from "@/types/dtos";
import { isAfter } from 'date-fns';
import { auth } from "@/auth";
import { parseDateTimeString } from "@/lib/utils";
import { Prisma } from '@prisma/client'
import { paginate } from "@/lib/pagination";
import { getUserFromRequest } from "@/lib/auth";

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
    const currentUser = await getUserFromRequest(request);
    const userId = currentUser?.id
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