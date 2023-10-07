import multer from 'multer'
import path from 'path'
import DataParser from 'datauri/parser.js'

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/uploads')
//   },
//   filename: (req, file, cb) => {
//     const fileName = file.originalname
//     cb(null, fileName)
//   },
// })

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(
      { msg: 'file uploaded is not supported. Please try (jpeg/png) again!' },
      false
    )
  }
}

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter,
})
const parser = new DataParser()

export const formatImage = file => {
  const fileExtension = path.extname(file.originalname).toString()
  return parser.format(fileExtension, file.buffer).content
}

export default upload