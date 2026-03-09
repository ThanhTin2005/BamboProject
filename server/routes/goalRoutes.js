const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authenticateToken = require('../middleware/authMiddleware');

// Cả 2 route này đều cần phải qua "chốt bảo vệ" authenticateToken
router.post('/', authenticateToken, goalController.createGoal);
router.get('/', authenticateToken, goalController.getGoals);

module.exports = router;