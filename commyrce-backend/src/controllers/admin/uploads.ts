import { asyncHandler } from '../../utils/asyncHandler.js'
import { uploadToCloudinary } from '../../middlewares/upload.js'

export const upload = asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: 'No images provided' })
    return
  }

  const urls = await Promise.all(files.map((file) => uploadToCloudinary(file)))
  res.status(201).json({ success: true, urls })
})