import type { Response } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env, isProduction } from '../config/env.js'

export const USER_COOKIE = 'cm_token'
export const ADMIN_COOKIE = 'cm_aid'

export interface UserTokenPayload {
  sub: string
  email: string
}

export interface AdminTokenPayload {
  sub: string
  email: string
  role: 'admin' | 'superadmin'
}

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: maxAgeMs,
    priority: 'high' as const
  }
}

export function setUserCookie(res: Response, payload: UserTokenPayload): void {
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions)
  const maxAge = ms(env.JWT_EXPIRES_IN)
  res.cookie(USER_COOKIE, token, cookieOptions(maxAge))
}

export function clearUserCookie(res: Response): void {
  res.clearCookie(USER_COOKIE, { path: '/' })
}

export function setAdminCookie(res: Response, payload: AdminTokenPayload): void {
  const token = jwt.sign(payload, env.ADMIN_JWT_SECRET, {
    expiresIn: env.ADMIN_JWT_EXPIRES_IN
  } as SignOptions)
  const maxAge = ms(env.ADMIN_JWT_EXPIRES_IN)
  res.cookie(ADMIN_COOKIE, token, cookieOptions(maxAge))
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(ADMIN_COOKIE, { path: '/' })
}

function ms(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry)
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const [, num, unit] = match
  const base = Number(num)
  switch (unit) {
    case 's':
      return base * 1000
    case 'm':
      return base * 60 * 1000
    case 'h':
      return base * 60 * 60 * 1000
    case 'd':
      return base * 24 * 60 * 60 * 1000
    default:
      return base * 1000
  }
}