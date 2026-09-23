import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { unauthorized } from '../utils/ApiError.js'
import { USER_COOKIE, type UserTokenPayload } from '../utils/tokens.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserTokenPayload
    }
  }
}

export const requireUser: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[USER_COOKIE]
  if (!token) {
    next(unauthorized('Please sign in to continue'))
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as UserTokenPayload
    if (!payload.sub) throw new Error('invalid payload')
    req.user = payload
    next()
  } catch {
    next(unauthorized('Session expired, please sign in again'))
  }
}

export const optionalUser: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[USER_COOKIE]
  if (!token) {
    next()
    return
  }
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as UserTokenPayload
  } catch {
    // treat as anonymous
  }
  next()
}