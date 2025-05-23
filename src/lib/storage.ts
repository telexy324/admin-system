import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 存储类型
type StorageType = 'local' | 'supabase';

// 存储配置接口
interface StorageConfig {
  type: StorageType;
  uploadDir?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  bucketName?: string;
}

// 文件存储服务类
export class StorageService {
  private config: StorageConfig;
  private supabase: any;

  constructor(config: StorageConfig) {
    this.config = config;
    
    if (config.type === 'supabase' && config.supabaseUrl && config.supabaseKey) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    }
  }

  // 上传文件
  async uploadFile(file: File, directory: string = ''): Promise<string> {
    if (this.config.type === 'local') {
      return this.uploadToLocal(file, directory);
    } else {
      return this.uploadToSupabase(file, directory);
    }
  }

  // 删除文件
  async deleteFile(filePath: string): Promise<void> {
    if (this.config.type === 'local') {
      return this.deleteFromLocal(filePath);
    } else {
      return this.deleteFromSupabase(filePath);
    }
  }

  // 获取文件URL
  async getFileUrl(filePath: string): Promise<string> {
    if (this.config.type === 'local') {
      return this.getLocalFileUrl(filePath);
    } else {
      return this.getSupabaseFileUrl(filePath);
    }
  }

  // 本地存储相关方法
  private async uploadToLocal(file: File, directory: string): Promise<string> {
    const uploadDir = path.join(this.config.uploadDir || 'uploads', directory);
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return path.join(directory, fileName);
  }

  private async deleteFromLocal(filePath: string): Promise<void> {
    const fullPath = path.join(this.config.uploadDir || 'uploads', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  private getLocalFileUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }

  // Supabase存储相关方法
  private async uploadToSupabase(file: File, directory: string): Promise<string> {
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = directory ? `${directory}/${fileName}` : fileName;

    const { data, error } = await this.supabase.storage
      .from(this.config.bucketName || 'default')
      .upload(filePath, file);

    if (error) throw error;
    return filePath;
  }

  private async deleteFromSupabase(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.config.bucketName || 'default')
      .remove([filePath]);

    if (error) throw error;
  }

  private getSupabaseFileUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.config.bucketName || 'default')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

// 创建存储服务实例
export const storageService = new StorageService({
  type: process.env.FILE_STORAGE_TYPE as StorageType || 'local',
  uploadDir: process.env.UPLOAD_DIR,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  bucketName: process.env.SUPABASE_STORAGE_BUCKET,
}); 