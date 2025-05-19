import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * 解析请求参数
 * @param request NextRequest 对象
 * @param schema Zod 验证模式
 * @returns 解析后的数据
 */
export async function parseRequest<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    // 获取请求方法
    const method = request.method;

    // 根据不同的请求方法解析数据
    let data: any;
    if (method === 'GET') {
      // 从 URL 参数中获取数据
      const searchParams = request.nextUrl.searchParams;
      data = Object.fromEntries(searchParams.entries());
    } else {
      // 从请求体中获取数据
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      }
    }

    // 使用 Zod 验证数据
    const validatedData = schema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`请求参数验证失败: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * 创建分页参数验证模式
 */
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => parseInt(val) || 10),
  search: z.string().optional(),
});

/**
 * 创建响应对象
 */
export function createResponse<T>(data: T, message: string = 'success', code: number = 200) {
  return Response.json({
    code,
    message,
    data,
  });
}

/**
 * 创建错误响应对象
 */
export function createErrorResponse(message: string = 'error', code: number = 400) {
  return Response.json({
    code,
    message,
    data: null,
  });
}

/**
 * 处理 API 错误
 */
export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  return createErrorResponse('未知错误');
} 