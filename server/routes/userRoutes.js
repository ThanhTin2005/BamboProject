const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware check token của ông

// Định nghĩa đường dẫn: PUT /api/users/profile
router.put('/profile', authMiddleware, userController.updateProfile);

// Thêm đường dẫn lấy thông tin profile
router.get("/profile", authMiddleware, userController.getUserProfile);

// Thêm đường dẫn upload ảnh
const uploadCloud = require("../config/cloudinaryConfig"); // Import middleware upload

// Thêm đường dẫn upload ảnh
router.post("/upload-image", authMiddleware, uploadCloud.single("image"), userController.uploadImage);

// Thêm đường dẫn tìm kiếm người dùng
router.get('/search', authMiddleware, userController.searchUsers);

module.exports = router;
