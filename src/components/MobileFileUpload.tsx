'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

interface MobileFileUploadProps {
  onUploadComplete?: (url: string) => void;
  maxSize?: number;
  accept?: string;
}

export function MobileFileUpload({
  onUploadComplete,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*,.pdf,.doc,.docx'
}: MobileFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: '文件过大',
        description: `文件大小不能超过 ${maxSize / 1024 / 1024}MB`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/mobile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      onUploadComplete?.(data.url);
      toast({
        title: '上传成功',
        description: '文件已成功上传',
      });
    } catch (error) {
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
      // 重置 input 值，允许重复上传相同文件
      event.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id="mobile-file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="mobile-file-upload"
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}
        >
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {uploading ? '正在上传...' : '点击选择文件'}
          </span>
        </label>

        {uploading && (
          <div className="w-full">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2 text-center">上传中...</p>
          </div>
        )}
      </div>
    </div>
  );
} 