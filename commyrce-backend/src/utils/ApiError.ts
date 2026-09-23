export class ApiError extends Error {
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

export function notFound(msg = 'Resource not found'): ApiError {
  return new ApiError(404, msg)
}

export function badRequest(msg: string, details?: unknown): ApiError {
  return new ApiError(400, msg, details)
}

export function unauthorized(msg = 'Authentication required'): ApiError {
  return new ApiError(401, msg)
}

export function forbidden(msg = 'Insufficient permissions'): ApiError {
  return new ApiError(403, msg)
}

export function conflict(msg: string): ApiError {
  return new ApiError(409, msg)
}