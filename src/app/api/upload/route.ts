import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 创建 Supabase 客户端
const supabase = process.env.STORAGE_TYPE === 'supabase' 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export async function POST(request: NextRequest) {
  try {
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

    if (process.env.STORAGE_TYPE === 'supabase') {
      // 上传到 Supabase Storage
      const { data, error } = await supabase!.storage
        .from('uploads')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // 获取文件公共URL
      const { data: { publicUrl } } = supabase!.storage
        .from('uploads')
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

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 