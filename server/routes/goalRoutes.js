const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const uploadCloud = require('../config/cloudinaryConfig');

// Cấu hình multer để xử lý upload file (cái đoạn storage ở dưới này đã được thay thế bằng uploadCloud trong config/cloudinaryConfig.js rồi nên không cần dùng nữa)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
//const upload = multer({ storage: storage });

// Cả 2 route này đều cần phải qua "chốt bảo vệ" authenticateToken
// Route này bây giờ sẽ tự động đẩy ảnh lên Cloudinary trước khi vào Controller
router.post("/", authenticateToken, uploadCloud.single("image"), goalController.createGoal);
router.get("/", authenticateToken, goalController.getGoals);
router.put("/:goalId", authenticateToken, uploadCloud.single("image"), goalController.updateGoal);
router.get("/:goalId", authenticateToken, goalController.getGoalById); // Thêm route lấy chi tiết Goal theo ID
//hai cái get không cần uploadCloud.single() vì chỉ lấy dữ liệu thôi, không có upload ảnh nào cả
router.delete('/:goalId', authenticateToken, goalController.deletePersonalGoal);
module.exports = router;
