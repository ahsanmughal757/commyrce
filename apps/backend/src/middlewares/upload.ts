import multer from 'multer'
import { cloudinary } from '../config/cloudinary.js'
import { badRequest } from '../utils/ApiError.js'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES = 8

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: MAX_IMAGES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(badRequest('Only image files are allowed'))
      return
    }
    cb(null, true)
  }
})

export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder = 'commyrce/products'
): Promise<string> {
  if (!cloudinary.config().cloud_name) {
    throw badRequest('Image hosting is not configured')
  }
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    secure: true,
    transformation: { quality: 'auto', flags: 'progressive' }
  })
  return result.secure_url
}