import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将 'yyyy-MM-dd HH:mm:ss' 格式的字符串转换为 Date 对象。
 * 如果格式不合法，抛出错误。
 *
 * @param dateStr - 格式为 'yyyy-MM-dd HH:mm:ss' 的字符串
 * @returns Date 实例
 */
export function parseDateTimeString(dateStr: string): Date {
  const parsed = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date())

  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }

  return parsed
}
