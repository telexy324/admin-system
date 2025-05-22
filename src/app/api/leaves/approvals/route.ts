import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { LeaveApprovalStats } from "@/types/nestapi";
import { RequestStatus } from "@/types/dtos";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    const userId = currentUser?.id
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    const totalUnApproveLeaves = await prisma.leave.count({
      where: {
        status: RequestStatus.PENDING,
      },
    });

    // 统计已审批 = 通过 + 拒绝（由当前 uid 审批）
    const [totalApprovalLeaves, totalRejectLeaves] = await Promise.all([
      prisma.leave.count({
        where: {
          status: RequestStatus.APPROVED,
          approverId: userId,
        },
      }),
      prisma.leave.count({
        where: {
          status: RequestStatus.REJECTED,
          approverId: userId,
        },
      }),
    ]);

    const stats: LeaveApprovalStats = {
      totalUnApproveLeaves,
      totalApprovalLeaves,
      totalRejectLeaves,
      totalApprovedLeaves: totalApprovalLeaves + totalRejectLeaves,
    }

    return createResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}