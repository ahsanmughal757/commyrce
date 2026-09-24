import bcrypt from 'bcryptjs'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { Admin } from '../../models/Admin.js'
import { unauthorized } from '../../utils/ApiError.js'
import { clearAdminCookie, setAdminCookie } from '../../utils/tokens.js'
import { loginSchema } from '../../validators/auth.js'

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)

  const admin = await Admin.findOne({ email }).select('+passwordHash')
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw unauthorized('Invalid admin credentials')
  }

  setAdminCookie(res, { sub: admin.id, email: admin.email, role: admin.role })
  res.json({
    success: true,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
  })
})

export const logout = asyncHandler(async (_req, res) => {
  clearAdminCookie(res)
  res.json({ success: true })
})

export const check = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin?.sub)
  if (!admin) throw unauthorized('Admin account no longer exists')
  res.json({
    success: true,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
  })
})