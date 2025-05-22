import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserFromRequest } from "@/lib/auth";
import { idParamsSchema } from "@/types/dtos";

export async function GET(request: NextRequest,context: { params: { id: string } }) {
  try {
    const params = await context.params;   // 这里必须 await context.params，获取真实对象
    const parsed = idParamsSchema.safeParse({
      id: String(params.id),
    });
    if (!parsed.success) {
      return createErrorResponse("请假记录ID不合法");
    }
    const id = parsed.data.id
    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        user: true,
        approver: true,
        proof: true,
        leaveBalances: true,
      }
    });
    console.log(leave);
    return createResponse(leave);
  } catch (error) {
    return handleApiError(error);
  }
}