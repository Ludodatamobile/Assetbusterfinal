import { ApiError } from './ApiError.js'

export function routeParam(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw ApiError.badRequest('Invalid route parameter.')
  }
  return value
}
