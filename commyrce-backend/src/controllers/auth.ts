import bcrypt from 'bcryptjs'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/User.js'
import { conflict, unauthorized } from '../utils/ApiError.js'
import { clearUserCookie, setUserCookie } from '../utils/tokens.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existing = await User.exists({ email })
  if (existing) throw conflict('An account with this email already exists')

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })

  setUserCookie(res, { sub: user.id, email: user.email })
  res.status(201).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email }
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized('Invalid email or password')
  }

  setUserCookie(res, { sub: user.id, email: user.email })
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email }
  })
})

export const logout = asyncHandler(async (_req, res) => {
  clearUserCookie(res)
  res.json({ success: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.sub)
  if (!user) throw unauthorized('Account no longer exists')
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
})