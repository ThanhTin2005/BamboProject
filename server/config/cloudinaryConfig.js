const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình chìa khóa
cloudinary.config({
  cloud_name: 'dygkci3pd',
  api_key: '152273691746798',
  api_secret: 'V99iLWFs4WKnD5qC0S92R14vNyc'
});

// Thiết lập kho lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bambo_goals', // Thư mục trên mây
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;