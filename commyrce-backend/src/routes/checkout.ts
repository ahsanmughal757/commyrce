import { Router } from 'express'
import * as checkout from '../controllers/checkout.js'
import { optionalUser } from '../middlewares/auth.js'
import { validateBody } from '../middlewares/validate.js'
import { checkoutSchema } from '../validators/checkout.js'

export const checkoutRouter = Router()

checkoutRouter.post('/', optionalUser, validateBody(checkoutSchema), checkout.createSession)
checkoutRouter.post('/webhook', checkout.stripeWebhook)