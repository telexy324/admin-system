import { NextRequest } from 'next/server';
import { storageService } from '@/lib/storage';
import { createResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    const userId = currentUser?.id;
    if (!userId) {
      return createErrorResponse("获取用户id失败");
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return createErrorResponse('未找到文件');
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('不支持的文件类型');
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return createErrorResponse('文件大小超过限制');
    }

    // 上传文件
    const filePath = await storageService.uploadFile(file, 'mobile');
    const fileUrl = await storageService.getFileUrl(filePath);

    // 保存文件信息到数据库
    const storage = await prisma.storage.create({
      data: {
        name: file.name,
        key: filePath,
        url: fileUrl,
        size: file.size,
        type: file.type,
        storageType: process.env.FILE_STORAGE_TYPE || 'local',
        bucket: process.env.FILE_STORAGE_TYPE === 'supabase' ? process.env.SUPABASE_STORAGE_BUCKET : null,
        userId,
      },
    });

    return createResponse({
      url: fileUrl,
      path: filePath,
      id: storage.id,
      name: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return createErrorResponse('未提供文件路径');
    }

    // 删除文件
    await storageService.deleteFile(path);

    // 删除数据库记录
    await prisma.storage.deleteMany({
      where: {
        key: path
      }
    });

    return createResponse(null, '文件删除成功');
  } catch (error) {
    return handleApiError(error);
  }
} 