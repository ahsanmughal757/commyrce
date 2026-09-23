import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'
import { badRequest } from '../utils/ApiError.js'

function validateWith(schema: ZodSchema, source: 'body' | 'query' | 'params'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      next(badRequest(`Invalid ${source === 'params' ? 'parameters' : 'payload'}`, result.error.flatten()))
      return
    }

    if (source === 'body') {
      req.body = result.data as never
    } else {
      // Express 5 exposes req.query / req.params as getter-only props that re-parse
      // on every access, so we redefine them with the validated value.
      Object.defineProperty(req, source, {
        value: result.data as never,
        writable: true,
        configurable: true,
        enumerable: true
      })
    }
    next()
  }
}

export const validateBody = (schema: ZodSchema): RequestHandler => validateWith(schema, 'body')
export const validateQuery = (schema: ZodSchema): RequestHandler => validateWith(schema, 'query')
export const validateParams = (schema: ZodSchema): RequestHandler => validateWith(schema, 'params')