export interface PaginationOptions {
  page?: number | string
  limit?: number | string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationResult<T> {
  data: T[]
  pagination: PaginationMeta
}

// Flexible parser for existing services
export function getPaginationParams(
  pageOrOptions?: number | string | PaginationOptions,
  limitArg?: number | string
) {
  let page: number
  let limit: number

  // Support old style:
  // getPaginationParams(page, limit)
  if (
    typeof pageOrOptions === 'string' ||
    typeof pageOrOptions === 'number' ||
    pageOrOptions === undefined
  ) {
    page = Number(pageOrOptions) || 1
    limit = Number(limitArg) || 10
  }

  // Support new style:
  // getPaginationParams({ page, limit })
  else {
    page = Number(pageOrOptions.page) || 1
    limit = Number(pageOrOptions.limit) || 10
  }

  page = Math.max(1, page)
  limit = Math.min(100, Math.max(1, limit))

  const skip = (page - 1) * limit
  const take = limit

  return {
    page,
    limit,
    skip,
    take,
  }
}

// Old architecture support
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// New architecture support
export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  return {
    data,
    pagination: buildPaginationMeta(
      total,
      page,
      limit
    ),
  }
}