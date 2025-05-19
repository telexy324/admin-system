'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export function FileUpload({ 
  onUploadComplete, 
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  }
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
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
      const response = await fetch('/api/upload', {
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
    }
  }, [maxSize, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-gray-600">将文件拖放到此处...</p>
          ) : (
            <div className="text-sm text-gray-600">
              <p>拖放文件到此处，或点击选择文件</p>
              <p className="text-xs text-gray-500 mt-1">
                支持的文件类型：图片、PDF、Word文档
              </p>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">正在上传...</p>
        </div>
      )}
    </div>
  );
} 