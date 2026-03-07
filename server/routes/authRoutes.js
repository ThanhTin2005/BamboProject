const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Định nghĩa các tuyến đường
// Khi có yêu cầu POST gửi đến /register, nó sẽ gọi hàm register trong Controller
router.post('/register', authController.register);

// Khi có yêu cầu POST gửi đến /login, nó sẽ gọi hàm login
router.post('/login', authController.login);

module.exports = router;