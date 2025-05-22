import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError, parseRequest } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { idParamsSchema, LeaveBalanceAction, LeaveUpdateDto, RequestStatus } from "@/types/dtos";
import { auth } from "@/auth";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request);
    const userId = currentUser?.id
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    const parsed = idParamsSchema.safeParse({
      id: String(context.params.id),
    });
    if (!parsed.success) {
      return createErrorResponse("请假记录ID不合法");
    }
    const id = parsed.data.id
    const data = await parseRequest(request, LeaveUpdateDto);
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
    // 更新请假记录
    await prisma.leave.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        comment: data.comment,
        approver: {
          connect: { id: userId },
        },
        doneAt: new Date(),
      },
      include: {
        approver: true,
        user: true,
      },
    });

    return createResponse();
  } catch (error) {
    return handleApiError(error);
  }
}