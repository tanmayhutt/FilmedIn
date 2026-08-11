const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    callback(allowed.includes(file.mimetype) ? null : new Error('Only JPG, PNG, and WebP images are allowed'), allowed.includes(file.mimetype));
  },
};

const uploadImage = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'image', format: 'webp', ...options },
    (error, result) => error ? reject(error) : resolve(result)
  );
  stream.end(buffer);
});

const avatarUpload = multer(uploadOptions);
const bannerUpload = multer(uploadOptions);

module.exports = { cloudinary, avatarUpload, bannerUpload, uploadImage };
