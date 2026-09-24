import { Router } from 'express'
import * as auth from '../controllers/auth.js'
import { requireUser } from '../middlewares/auth.js'
import { validateBody } from '../middlewares/validate.js'
import { loginSchema, registerSchema } from '../validators/auth.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerSchema), auth.register)
authRouter.post('/login', validateBody(loginSchema), auth.login)
authRouter.post('/logout', auth.logout)
authRouter.get('/me', requireUser, auth.me)