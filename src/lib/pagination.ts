import { Prisma } from '@prisma/client'
import { Pagination } from "@/types/dtos";

interface PaginateParams<TWhere, TOrderBy> {
  where?: TWhere
  orderBy?: TOrderBy
  page?: number
  pageSize?: number
}

export async function paginate<
  T,
  TWhere = Record<string, unknown>,
  TOrderBy = Record<string, Prisma.SortOrder>
>(
  model: {
    findMany: (args: {
      where?: TWhere
      orderBy?: TOrderBy
      skip?: number
      take?: number
    }) => Promise<T[]>
    count: (args: { where?: TWhere }) => Promise<number>
  },
  { where, orderBy, page = 1, pageSize = 10 }: PaginateParams<TWhere, TOrderBy>,
): Promise<Pagination<T>> {
  const skip = (page - 1) * pageSize

  const [items, totalItems] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    model.count({ where }),
  ])

  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    items,
    meta: {
      itemCount: items.length,
      totalItems,
      itemsPerPage: pageSize,
      totalPages,
      currentPage: page,
    },
  }
}