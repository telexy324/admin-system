import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    return createResponse();
  } catch (error) {
    return handleApiError(error);
  }
}