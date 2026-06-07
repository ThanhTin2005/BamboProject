const express = require('express');
//const { protect } = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware check token của ông
const { toggleFollow, toggleLike, addComment, getComments, getFeed, addFriendByCode,getFriends ,getFriendProfile,toggleFistBump} = require('../controllers/socialController');

const router = express.Router();

router.post('/toggleFollow', authMiddleware, toggleFollow);
router.post('/toggleLike', authMiddleware, toggleLike);
router.post('/addComment', authMiddleware, addComment);
router.get('/getComments/:postId', authMiddleware, getComments);
router.get('/getFeed', authMiddleware, getFeed);
router.post('/add-by-code', authMiddleware, addFriendByCode);
router.get('/friends', authMiddleware, getFriends);
router.get('/friend-profile/:friendId', authMiddleware, getFriendProfile); // API lấy profile + goals công khai của bạn bè
//cái friendId này là ID của người bạn muốn xem profile,  sẽ truyền từ Frontend vào khi bấm vào tên bạn bè đó trong danh sách bạn bè 
router.post('/bump', authMiddleware, toggleFistBump); // API đấm tay đồng đội (thêm cái này sau cũng được, chưa cần thiết lắm)

module.exports = router;
