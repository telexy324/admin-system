import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { LeaveStats } from "@/types/nestapi";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    const result = await prisma.leaveBalance.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true,
      },
    });

    const stats: LeaveStats = {
      totalCompensatoryLeaves: 0,
      usedCompensatoryLeaves: 0,
      totalAnnualLeaves: 0,
      usedAnnualLeaves: 0,
      totalSickLeaves: 0,
      usedSickLeaves: 0,
      totalPersonalLeaves: 0,
      usedPersonalLeaves: 0,
    }

    const grouped = new Map<number, { total: number; used: number }>();

    for (const record of result) {
      const type = record.type;
      const entry = grouped.get(type) ?? { total: 0, used: 0 };

      if (record.amount.gte(0)) {
        entry.total += Number(record.amount);
      } else {
        entry.used += Math.abs(Number(record.amount));
      }

      grouped.set(type, entry);
    }

    for (const [type, { total, used }] of grouped.entries()) {
      switch (type) {
        case 1:
          stats.totalCompensatoryLeaves = total;
          stats.usedCompensatoryLeaves = used;
          break;
        case 2:
          stats.totalAnnualLeaves = total;
          stats.usedAnnualLeaves = used;
          break;
        case 3:
          stats.totalSickLeaves = total;
          stats.usedSickLeaves = used;
          break;
        case 4:
          stats.totalPersonalLeaves = total;
          stats.usedPersonalLeaves = used;
          break;
      }
    }

    return createResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}