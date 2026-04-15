const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Import 2 "ông bảo vệ"
const  authenticateToken  = require('../middleware/authMiddleware'); // Check đăng nhập
const uploadCloud = require('../config/cloudinaryConfig'); // Đẩy ảnh lên mây (Day 15)

// Định nghĩa API: POST /api/logs
// Luồng đi: Bắt phải có Token -> Hứng file 'image' đẩy lên mây -> Chạy logic tạo log
router.post('/', authenticateToken, uploadCloud.single('image'), logController.createLog);
// GET /api/logs/1 (Lấy tất cả log của goal có ID là 1)
router.get('/:goal_id', authenticateToken, logController.getLogsByGoal);

module.exports = router;