const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateToken  = require('../middleware/authMiddleware'); // Middleware check JWT hiện tại của ông
const uploadCloud = require('../config/cloudinaryConfig'); // Đẩy ảnh lên mây (Day 15)


router.post('/', authenticateToken, uploadCloud.single('image'), groupController.createGroup);
router.post('/join', authenticateToken, groupController.joinGroup);
router.get('/my-groups', authenticateToken, groupController.getMyGroups);
router.post('/:groupId/logs', authenticateToken, uploadCloud.single('image'), groupController.submitGroupLog);
router.get('/:groupId/timeline', authenticateToken, groupController.getGroupTimeline);
router.put('/:groupId/logs/:logId/review', authenticateToken, groupController.reviewGroupLog);
router.get('/:groupId/gallery', authenticateToken, groupController.getGroupGallery);

module.exports = router;