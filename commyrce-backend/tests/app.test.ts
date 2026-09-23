import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { loginSchema, registerSchema } from '../src/validators/auth.js'
import { productUpsertSchema } from '../src/validators/product.js'
import { checkoutSchema } from '../src/validators/checkout.js'

const app = createApp()

describe('Validator unit tests', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'supersecret1'
    })
    expect(result.success).toBe(true)
  })

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'short'
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid checkout payload', () => {
    const result = checkoutSchema.safeParse({
      items: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }]
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty checkout', () => {
    const result = checkoutSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })

  it('coerces product prices and defaults', () => {
    const result = productUpsertSchema.safeParse({
      name: 'Test Product',
      priceCents: '2999',
      category: 'electronics'
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priceCents).toBe(2999)
      expect(result.data.stock).toBe(0)
      expect(result.data.published).toBe(true)
    }
  })
})

describe('HTTP smoke tests (no DB required)', () => {
  it('responds to health check with success flag', async () => {
    const res = await request(app).get('/api/health')
    expect(res.body.success).toBe(true)
    expect(res.body.service).toBe('commyrce-api')
  })

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('rejects invalid JSON body with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken')
    expect(res.status).toBe(400)
  })

  it('rejects login with invalid email (validation)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad', password: '12345678' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/payload/i)
  })

  it('rejects an over-long product slug (validation before DB)', async () => {
    const res = await request(app).get(`/api/products/${'a'.repeat(250)}`)
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})