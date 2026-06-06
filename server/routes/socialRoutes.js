const express = require('express');
//const { protect } = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware check token của ông
const { toggleFollow, toggleLike, addComment, getComments, getFeed, addFriendByCode,getFriends } = require('../controllers/socialController');

const router = express.Router();

router.post('/toggleFollow', authMiddleware, toggleFollow);
router.post('/toggleLike', authMiddleware, toggleLike);
router.post('/addComment', authMiddleware, addComment);
router.get('/getComments/:postId', authMiddleware, getComments);
router.get('/getFeed', authMiddleware, getFeed);
router.post('/add-by-code', authMiddleware, addFriendByCode);
router.get('/friends', authMiddleware, getFriends);

module.exports = router;
