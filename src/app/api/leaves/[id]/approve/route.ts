import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError, parseRequest } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { LeaveUpdateDto } from "@/types/dtos";

export async function PUT(request: NextRequest) {
  try {
    const data = await parseRequest(request, LeaveUpdateDto);

    if (!data.id) {
      return createErrorResponse("请假记录ID不能为空");
    }

    // 检查请假记录是否存在
    const existingLeave = await prisma.leave.findUnique({
      where: { id: data.id },
    });

    if (!existingLeave) {
      return createErrorResponse("请假记录不存在");
    }

    // 检查是否可以修改
    if (existingLeave.status !== 0) { // 0 表示待审批
      return createErrorResponse("已审批的请假记录不能修改");
    }

    // 检查时间是否合法
    if (data.startDate >= data.endDate) {
      return createErrorResponse("开始时间必须早于结束时间");
    }

    // 检查是否有重叠的请假记录
    const overlappingLeave = await prisma.leave.findFirst({
      where: {
        userId: data.userId,
        id: { not: data.id },
        status: { not: 2 }, // 2 表示已拒绝
        OR: [
          {
            startDate: { lte: data.startDate },
            endDate: { gt: data.startDate },
          },
          {
            startDate: { lt: data.endDate },
            endDate: { gte: data.endDate },
          },
        ],
      },
    });

    if (overlappingLeave) {
      return createErrorResponse("该时间段内已有请假记录");
    }

    // 更新请假记录
    const leave = await prisma.leave.update({
      where: { id: data.id },
      data: {
        typeId: data.typeId,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        reason: data.reason,
        status: data.status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        comment: data.comment,
      },
      include: {
        user: true,
        approver: true,
        type: true,
      },
    });

    return createResponse(leave);
  } catch (error) {
    return handleApiError(error);
  }
}