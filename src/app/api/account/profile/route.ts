import { NextRequest } from "next/server";
import { createErrorResponse, createResponse, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    const userId = currentUser?.id
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
            menus: true
          }
        }
      }
    });
    const isAdmin = !!user?.roles.some(role => role.name === 'admin')
    return createResponse({
      ...user,
      isAdmin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}