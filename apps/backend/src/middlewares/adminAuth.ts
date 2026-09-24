import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { forbidden, unauthorized } from '../utils/ApiError.js'
import { ADMIN_COOKIE, type AdminTokenPayload } from '../utils/tokens.js'

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload
    }
  }
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE]
  if (!token) {
    next(unauthorized('Admin sign-in required'))
    return
  }

  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminTokenPayload
    if (!payload.sub) throw new Error('invalid payload')
    req.admin = payload
    next()
  } catch {
    next(unauthorized('Admin session expired, please sign in again'))
  }
}

export const requireSuperAdmin: RequestHandler = (req, _res, next) => {
  if (!req.admin) {
    next(unauthorized('Admin sign-in required'))
    return
  }
  if (req.admin.role !== 'superadmin') {
    next(forbidden('Super admin privileges required'))
    return
  }
  next()
}