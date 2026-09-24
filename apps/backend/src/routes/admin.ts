import { Router } from 'express'
import * as adminAuth from '../controllers/admin/auth.js'
import * as adminProducts from '../controllers/admin/products.js'
import * as adminCategories from '../controllers/admin/categories.js'
import * as adminDashboard from '../controllers/admin/dashboard.js'
import * as adminUploads from '../controllers/admin/uploads.js'
import { requireAdmin } from '../middlewares/adminAuth.js'
import { validateBody } from '../middlewares/validate.js'
import { uploadImages } from '../middlewares/upload.js'
import { loginSchema } from '../validators/auth.js'
import {
  adminIndexQueryValidator,
  categoryByIdParamsValidator,
  categoryUpsertSchema,
  productByIdParamsValidator,
  productToggleSchema,
  productUpsertSchema
} from '../validators/product.js'

export const adminRouter = Router()

adminRouter.post('/auth/login', validateBody(loginSchema), adminAuth.login)
adminRouter.post('/auth/logout', adminAuth.logout)

adminRouter.use(requireAdmin)

adminRouter.get('/auth/check', adminAuth.check)
adminRouter.get('/dashboard', adminDashboard.summary)

adminRouter.get('/products', adminIndexQueryValidator, adminProducts.index)
adminRouter.get('/products/:id', productByIdParamsValidator, adminProducts.get)
adminRouter.post('/products', validateBody(productUpsertSchema), adminProducts.create)
adminRouter.patch(
  '/products/:id',
  productByIdParamsValidator,
  validateBody(productUpsertSchema),
  adminProducts.update
)
adminRouter.patch(
  '/products/:id/toggle',
  productByIdParamsValidator,
  validateBody(productToggleSchema),
  adminProducts.toggle
)
adminRouter.delete('/products/:id', productByIdParamsValidator, adminProducts.remove)

adminRouter.get('/categories', adminCategories.index)
adminRouter.post('/categories', validateBody(categoryUpsertSchema), adminCategories.create)
adminRouter.patch(
  '/categories/:id',
  categoryByIdParamsValidator,
  validateBody(categoryUpsertSchema),
  adminCategories.update
)
adminRouter.delete('/categories/:id', categoryByIdParamsValidator, adminCategories.remove)

adminRouter.post('/uploads', uploadImages.array('images', 8), adminUploads.upload)