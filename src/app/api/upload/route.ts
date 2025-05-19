import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// 创建 Supabase 客户端
const supabase = process.env.STORAGE_TYPE === 'supabase' 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 验证文件大小
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    let fileUrl: string;
    let bucket: string | null = null;

    if (process.env.STORAGE_TYPE === 'supabase') {
      // 上传到 Supabase Storage
      bucket = 'uploads';
      const { data, error } = await supabase!.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // 获取文件公共URL
      const { data: { publicUrl } } = supabase!.storage
        .from(bucket)
        .getPublicUrl(fileName);

      fileUrl = publicUrl;
    } else {
      // 本地存储
      const uploadDir = process.env.UPLOAD_DIR || 'public/uploads';
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // 确保上传目录存在
      await writeFile(join(process.cwd(), uploadDir, fileName), buffer);
      
      fileUrl = `/${uploadDir}/${fileName}`;
    }

    // 保存文件信息到数据库
    const storage = await prisma.storage.create({
      data: {
        name: file.name,
        key: fileName,
        url: fileUrl,
        size: file.size,
        type: file.type,
        storageType: process.env.STORAGE_TYPE || 'local',
        bucket: bucket,
        userId: session?.user?.id ? Number(session.user.id) : null,
      },
    });

    return NextResponse.json({ 
      url: fileUrl,
      id: storage.id,
      name: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 