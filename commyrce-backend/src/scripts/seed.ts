/* Demo data seeder — `npm run seed` */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Admin, AdminDoc, AdminRole } from '../models/Admin.js'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { slugify } from '../utils/slugify.js'

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@commyrce.com'
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!'
const SEED_ADMIN_ROLE = (process.env.SEED_ADMIN_ROLE ?? 'superadmin') as AdminRole

const categories = [
  { name: 'Electronics' },
  { name: 'Mobiles and Accessories' },
  { name: 'Tools' },
  { name: 'Appliances' },
  { name: 'Home and Kitchen' },
  { name: 'Fashion' }
]

const demoProducts: Array<{
  name: string
  category: number
  priceCents: number
  discountPercent?: number
  stock: number
  sku?: string
  tags: string[]
  description: string
}> = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    category: 0,
    priceCents: 29999,
    discountPercent: 20,
    stock: 42,
    sku: 'EL-AUD-001',
    tags: ['audio', 'wireless', 'headphones'],
    description: 'Immersive sound with active noise cancellation, 30h battery and plush ear cushions.'
  },
  {
    name: '4K Smart TV 55 inch',
    category: 0,
    priceCents: 54999,
    discountPercent: 15,
    stock: 12,
    sku: 'EL-TV-055',
    tags: ['tv', '4k', 'smart'],
    description: 'Cinematic 4K HDR display with built-in streaming apps and voice remote.'
  },
  {
    name: 'Mechanical Gaming Keyboard',
    category: 0,
    priceCents: 8999,
    stock: 80,
    tags: ['keyboard', 'gaming', 'rgb'],
    description: 'Tactile switches, per-key RGB and full aluminum construction.'
  },
  {
    name: 'Flagship Android Phone 256GB',
    category: 1,
    priceCents: 79999,
    discountPercent: 10,
    stock: 25,
    sku: 'MB-PHN-256',
    tags: ['phone', 'android', '5g'],
    description: '120Hz AMOLED display, triple camera and all-day battery.'
  },
  {
    name: 'Silicone Phone Case',
    category: 1,
    priceCents: 1999,
    stock: 200,
    tags: ['case', 'accessory'],
    description: 'Shock-absorbing silicone case with a soft-touch finish.'
  },
  {
    name: 'USB-C Fast Wall Charger 65W',
    category: 1,
    priceCents: 2999,
    discountPercent: 25,
    stock: 150,
    sku: 'MB-CHR-065',
    tags: ['charger', 'usb-c', 'adapter'],
    description: 'Compact GaN charger powering phones and laptops at full speed.'
  },
  {
    name: 'Cordless Drill Driver 20V',
    category: 2,
    priceCents: 12999,
    stock: 30,
    tags: ['drill', 'power-tool', 'diy'],
    description: 'Variable speed and torque, includes two batteries and carry case.'
  },
  {
    name: 'Professional Screwdriver Set 100pc',
    category: 2,
    priceCents: 4999,
    discountPercent: 30,
    stock: 65,
    sku: 'TL-SET-100',
    tags: ['screwdriver', 'kit', 'hardware'],
    description: 'Magnetic bits with precision drivers in a durable organizer case.'
  },
  {
    name: 'Air Fryer 6.5L Digital',
    category: 3,
    priceCents: 11999,
    discountPercent: 18,
    stock: 48,
    sku: 'AP-AFR-065',
    tags: ['air-fryer', 'kitchen', 'healthy'],
    description: 'Crisp food with 90% less oil, preset modes and a large basket.'
  },
  {
    name: 'Robot Vacuum Cleaner',
    category: 3,
    priceCents: 27999,
    stock: 18,
    tags: ['vacuum', 'robot', 'smart-home'],
    description: 'Self-docking robot with mapping, scheduling and strong suction.'
  },
  {
    name: 'Stainless Steel Cookware Set 12pc',
    category: 4,
    priceCents: 15999,
    discountPercent: 12,
    stock: 55,
    sku: 'HK-POT-012',
    tags: ['cookware', 'kitchen', 'steel'],
    description: 'Durable tri-ply construction suitable for all stovetops and oven-safe lids.'
  },
  {
    name: 'Ergonomic Office Chair',
    category: 4,
    priceCents: 24999,
    stock: 22,
    tags: ['chair', 'office', 'ergonomic'],
    description: 'Breathable mesh back, adjustable lumbar support and recline.'
  },
  {
    name: 'Men Summer Polo Shirt',
    category: 5,
    priceCents: 2499,
    discountPercent: 40,
    stock: 120,
    sku: 'FA-POLO-M',
    tags: ['men', 'polo', 'summer'],
    description: 'Breathable cotton blend polo in a regular fit.'
  },
  {
    name: 'Classic Leather Sneakers',
    category: 5,
    priceCents: 8999,
    discountPercent: 15,
    stock: 74,
    tags: ['shoes', 'sneakers', 'leather'],
    description: 'Timeless low-top design with cushioned insole and rubber outsole.'
  },
  {
    name: 'Water-Resistant Backpack 25L',
    category: 5,
    priceCents: 5499,
    stock: 90,
    tags: ['backpack', 'travel', 'waterproof'],
    description: 'Laptop sleeve, padded straps and water-resistant ripstop fabric.'
  }
]

async function seed(): Promise<void> {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('MONGO_URI not set')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('📦 Connected. Seeding...')

  // Drop legacy unique index from the old schema that no longer exists in the model
  const productIndexes = await Product.collection.indexes()
  const staleIndexes = productIndexes.filter(
    (idx) =>
      idx.name === 'productName_1' ||
      (idx.unique && typeof idx.key === 'object' && idx.key !== null && 'productName' in idx.key)
  )
  for (const idx of staleIndexes) {
    if (typeof idx.name === 'string') {
      await Product.collection.dropIndex(idx.name)
      console.log(`↪ Dropped stale index: ${idx.name}`)
    }
  }

  const adminExists = await Admin.exists({ email: SEED_ADMIN_EMAIL })
  if (adminExists) {
    console.log(`↪ Admin ${SEED_ADMIN_EMAIL} already exists, updating password/role`)
    await Admin.updateOne(
      { email: SEED_ADMIN_EMAIL },
      { role: SEED_ADMIN_ROLE, passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 12) }
    )
  } else {
    await Admin.create({
      name: 'Store Admin',
      email: SEED_ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 12),
      role: SEED_ADMIN_ROLE
    } as AdminDoc)
    console.log(`✓ Admin created: ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`)
  }

  const categoryIds: string[] = []
  for (const cat of categories) {
    let doc = await Category.findOne({ slug: slugify(cat.name) })
    if (!doc) {
      doc = await Category.create({ name: cat.name, slug: slugify(cat.name) })
      console.log(`✓ Category: ${cat.name}`)
    }
    categoryIds.push(doc.id)
  }

  for (const [i, p] of demoProducts.entries()) {
    if (await Product.findOne({ name: p.name })) {
      console.log(`↪ Skipped (name exists): ${p.name}`)
      continue
    }
    if (p.sku && (await Product.findOne({ sku: p.sku }))) {
      console.log(`↪ Skipped (sku exists): ${p.name}`)
      continue
    }

    const base = slugify(p.name)
    let slug = base
    let counter = 2
    while (await Product.exists({ slug })) {
      slug = `${base}-${counter}`
      counter += 1
    }

    await Product.create({
      name: p.name,
      slug,
      description: p.description,
      priceCents: p.priceCents,
      discountPercent: p.discountPercent ?? 0,
      category: categoryIds[p.category],
      stock: p.stock,
      sku: p.sku,
      tags: p.tags,
      images: [
        `https://picsum.photos/seed/commyrce-${i}-a/800/800`,
        `https://picsum.photos/seed/commyrce-${i}-b/800/800`
      ],
      published: true,
      featured: i % 4 === 0
    })
    console.log(`✓ Product: ${p.name}`)
  }

  console.log('✅ Seed complete')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})