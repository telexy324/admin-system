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
        const formEntries: [string, string][] = [];
        for (const pair of formData as unknown as Iterable<[string, FormDataEntryValue]>) {
          const [key, value] = pair;
          if (value !== null) {
            formEntries.push([key, value.toString()]);
          }
        }
        data = Object.fromEntries(formEntries);
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        // 处理文件上传
        const files: Record<string, File> = {};
        const fields: Record<string, string> = {};
        
        for (const pair of formData as unknown as Iterable<[string, FormDataEntryValue]>) {
          const [key, value] = pair;
          if (value instanceof File) {
            files[key] = value;
          } else if (value !== null) {
            fields[key] = value.toString();
          }
        }
        
        data = {
          ...fields,
          files: Object.keys(files).length > 0 ? files : undefined
        };
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
  page: z.string()
    .transform(val => parseInt(val) || 1)
    .refine(val => val > 0, '页码必须大于 0'),
  limit: z.string()
    .transform(val => parseInt(val) || 10)
    .refine(val => val > 0 && val <= 100, '每页数量必须在 1-100 之间'),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

/**
 * 创建响应对象
 */
export function createResponse<T = undefined>(data?: T, message: string = 'success', code: number = 200) {
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
    // 处理 Prisma 错误
    if (error.name === 'PrismaClientKnownRequestError') {
      return createErrorResponse('数据库操作失败', 500);
    }
    if (error.name === 'PrismaClientValidationError') {
      return createErrorResponse('数据验证失败', 400);
    }
    // 处理 Zod 错误
    if (error instanceof z.ZodError) {
      return createErrorResponse(`数据验证失败: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
    // 处理其他错误
    return createErrorResponse(error.message);
  }
  return createErrorResponse('未知错误');
}

/**
 * 创建分页响应
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'success'
) {
  return createResponse({
    items: data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }, message);
} 