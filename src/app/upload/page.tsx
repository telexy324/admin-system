'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { MobileFileUpload } from '@/components/MobileFileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [mobileUploadedFile, setMobileUploadedFile] = useState<string>('');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">文件上传示例</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* 桌面端上传 */}
        <Card>
          <CardHeader>
            <CardTitle>桌面端上传</CardTitle>
            <CardDescription>
              支持拖拽上传和点击上传，最大文件大小 5MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadComplete={setUploadedFile} />
            {uploadedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">已上传文件：</p>
                <a 
                  href={uploadedFile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {uploadedFile}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 移动端上传 */}
        <Card>
          <CardHeader>
            <CardTitle>移动端上传</CardTitle>
            <CardDescription>
              优化移动端体验，最大文件大小 2MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MobileFileUpload onUploadComplete={setMobileUploadedFile} />
            {mobileUploadedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">已上传文件：</p>
                <a 
                  href={mobileUploadedFile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {mobileUploadedFile}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 