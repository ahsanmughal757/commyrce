import { Router } from 'express'
import * as products from '../controllers/products.js'
import { productIndexQueryValidator, productSlugParamsValidator } from '../validators/product.js'

export const productsRouter = Router()

productsRouter.get('/', productIndexQueryValidator, products.index)
productsRouter.get('/categories', products.categories)
productsRouter.get('/:slug', productSlugParamsValidator, products.getBySlug)