import { z } from "zod";

// export const leaveUpdateSchema = z.object({
//   amount: z.string().optional(),
//
//   type: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
//
//   startDate: z
//     .string()
//     .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
//       message: "开始时间格式错误，正确格式为 YYYY-MM-DD HH:mm:ss",
//     })
//     .optional(),
//
//   endDate: z
//     .string()
//     .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
//       message: "结束时间格式错误，正确格式为 YYYY-MM-DD HH:mm:ss",
//     })
//     .optional(),
//
//   reason: z.string().min(8, { message: "请假事由至少为 8 个字符" }).optional(),
//
//   proof: z.array(z.number()).optional(),
//
//   comment: z.string().optional(),
//
//   status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
// });

export const idParamsSchema = z.object({
  id: z.coerce.number({ invalid_type_error: "id 必须为数字" }),
});


export const LeaveType = z.enum(['1', '2', '3', '4', '5']).transform(Number);
export type LeaveType = z.infer<typeof LeaveType>;

export const LeaveStatus = z.enum(['1', '2', '3', '4']).transform(Number);
export type LeaveStatus = z.infer<typeof LeaveStatus>;

export const Order = z.enum(['ASC', 'DESC']);
export type Order = z.infer<typeof Order>;

const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const PagerDto = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  field: z.string().optional(),
  order: Order.optional(),
  _t: z.coerce.number().optional(),
});

export const LeaveDto = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'amount 必须是最多两位小数的数字字符串'),
  type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  startDate: z
    .string()
    .regex(dateTimePattern, '开始时间格式应为 yyyy-MM-dd HH:mm:ss'),
  endDate: z
    .string()
    .regex(dateTimePattern, '结束时间格式应为 yyyy-MM-dd HH:mm:ss'),
  reason: z.string().min(8),
  proof: z.array(z.number()).optional(),
  comment: z.string().optional(),
  status: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const LeaveUpdateDto = LeaveDto.partial();

export const LeaveQueryDto = PagerDto.extend({
  type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).optional(),
  status: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  startDate: z.string().regex(dateTimePattern).optional(),
  endDate: z.string().regex(dateTimePattern).optional(),
});

export const LeaveBalanceDto = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'amount 必须是最多两位小数的数字字符串'),
  type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  startDate: z.string().regex(dateTimePattern),
  endDate: z.string().regex(dateTimePattern),
  reason: z.string().min(8),
  proof: z.string().optional(),
  comment: z.string().optional(),
});

export const LeaveBalanceUpdateDto = LeaveBalanceDto.partial();

export const LeaveBalanceQueryDto = PagerDto.extend({
  type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).optional(),
  startDate: z.string().regex(dateTimePattern).optional(),
  endDate: z.string().regex(dateTimePattern).optional(),
});

export enum RequestStatus {
  PENDING = 1,
  APPROVED,
  REJECTED,
  CANCELLED,
}

export enum LeaveBalanceAction {
  REQUEST = 1,
  CANCEL,
}

export interface Pagination<T>{
  items?: T[];
  meta?: {
    itemCount?: number;
    totalItems?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
}

export type LeaveListParams = {
  page?: number;
  pageSize?: number;
  field?: string;
  order?: 'ASC' | 'DESC';
  type?: 1 | 2 | 3 | 4 | 5;
  status?: 1 | 2 | 3;
  startDate?: string;
  endDate?: string;
  _t?: number;
};

export const LoginDto = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
});

export const RegisterDto = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().optional(),
});
