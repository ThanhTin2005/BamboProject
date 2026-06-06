const db = require("../db"); // Đường dẫn tới file kết nối DB của ông

const toggleFollow = async (req, res) => {
  // Logic for toggling follow
};

const toggleLike = async (req, res) => {
  // Logic for toggling like
};

const addComment = async (req, res) => {
  // Logic for adding a comment
};

const getComments = async (req, res) => {
  // Logic for getting comments
};

const getFeed = async (req, res) => {
  const userId = req.user.id; // ID của chính người dùng đang đăng nhập (lấy từ authMiddleware)
  try {
    // CÂU LỆNH SQL LIÊN HOÀN 4 BẢNG CHUẨN THEO ĐỊNH HƯỚNG BẠN BÈ/FOLLOW
    const query = `
        SELECT 
            u.user_id,
            l.log_id,
            l.caption,
            l.mood,
            l.image_url AS log_image,
            l.created_at AS log_created_at,
            g.title AS goal_title,
            g.color AS goal_color,
            u.username AS creator_name,
            u.avatar_url AS creator_avatar
        FROM logs l
        -- TẦNG 1: KẾT NỐI DỮ LIỆU (JOIN)
        JOIN goals g ON l.goal_id = g.goal_id
        JOIN users u ON l.user_id = u.user_id
        -- TẦNG 2: BỘ LỌC KIỂU LOCKET (WHERE)
        WHERE 
            g.is_public = 1 
            -- 1. CHIỀU ĐI: Tôi phải follow người ta
            AND l.user_id IN (
                SELECT following_id FROM followers WHERE follower_id = ?
            )
            -- 2. CHIỀU VỀ: Người ta phải follow lại tôi
            AND l.user_id IN (
                SELECT follower_id FROM followers WHERE following_id = ?
            )
        ORDER BY l.created_at DESC;
    `;

    // Thực thi câu lệnh query với db (hãy chắc chắn đầu file ông đã require biến db/pool kết nối MySQL nhé)
    const [feedItems] = await db.execute(query, [userId, userId]);

    // Trả dữ liệu mượt mà về cho Frontend
    res.json(feedItems);

  } catch (error) {
    console.error("Lỗi khi lấy Bảng tin social feed:", error);
    res.status(500).json({ error: "Không thể tải bảng tin lúc này!" });
  }
};

// [API 1] - XỬ LÝ NÚT BẤM KẾT BẠN
const addFriendByCode = async (req, res) => {
  const myId = req.user.id; 
  const { inviteCode } = req.body; 

  try {
    // 1. Tìm người sở hữu mã này
    const [users] = await db.query('SELECT user_id, username FROM users WHERE invite_code = ?', [inviteCode]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "Mã mời không tồn tại! Check lại chính tả nhé." });
    }

    const friendId = users[0].user_id;

    // 2. Chặn lỗi tự kết bạn với chính mình
    if (friendId === myId) {
      return res.status(400).json({ error: "Không thể tự kết bạn với chính mình!" });
    }

    // 3. Kích hoạt Mutual Follow (Follow chéo) thần tốc bằng INSERT IGNORE
    await db.query(`
      INSERT IGNORE INTO followers (follower_id, following_id) 
      VALUES (?, ?), (?, ?)
    `, [myId, friendId, friendId, myId]); 

    res.status(200).json({ message: `Đã kết nối thành công với ${users[0].username}! 🎍` });

  } catch (error) {
    console.error("Lỗi khi kết bạn bằng mã:", error);
    res.status(500).json({ error: "Lỗi Server, vui lòng thử lại sau." });
  }
};

// [API 2] - LẤY DANH SÁCH BẠN BÈ VÀ MÃ CỦA MÌNH
const getFriends = async (req, res) => {
  const myId = req.user.id;

  try {
    // 1. Lấy mã invite_code của chính mình
    const [me] = await db.query('SELECT invite_code FROM users WHERE user_id = ?', [myId]);
    const myCode = me.length > 0 ? me[0].invite_code : 'CHƯA_CÓ_MÃ';

    // 2. Lấy danh sách bạn bè 2 chiều
    const [friends] = await db.query(`
      SELECT u.user_id, u.username, u.avatar_url 
      FROM followers f
      JOIN users u ON f.following_id = u.user_id
      WHERE f.follower_id = ? 
        AND f.following_id IN (SELECT follower_id FROM followers WHERE following_id = ?)
    `, [myId, myId]);

    // Trả về cả cụm cho Frontend dùng
    res.status(200).json({ 
      myCode: myCode, 
      friends: friends 
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách bạn bè:", error);
    res.status(500).json({ error: "Lỗi Server." });
  }
};

// [API 3] - LẤY THÔNG TIN PROFILE VÀ GOALS PUBLIC CỦA BẠN BÈ
const getFriendProfile = async (req, res) => {
  const friendId = req.params.friendId;

  try {
    // 1. Lấy thông tin cơ bản của bạn bè (Avatar, Tên)
    const [userInfo] = await db.query(
      'SELECT user_id, username, avatar_url FROM users WHERE user_id = ?', 
      [friendId]
    );
    
    if (userInfo.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    // 2. Lấy danh sách Mục tiêu (Goals) CHỈ CÔNG KHAI của người đó
    // Giả định bảng goals của ông có cột is_public (1 là công khai, 0 là riêng tư)
    const [publicGoals] = await db.query(`
      SELECT goal_id, title, description, color, cover_image_url 
      FROM goals 
      WHERE user_id = ? AND is_public = 1
      ORDER BY created_at DESC
    `, [friendId]);

    // 3. Đóng gói trả về Frontend
    res.status(200).json({
      profile: userInfo[0],
      goals: publicGoals
    });

  } catch (error) {
    console.error("Lỗi lấy profile bạn bè:", error);
    res.status(500).json({ error: "Lỗi Server." });
  }
};

module.exports = { toggleFollow, toggleLike, addComment, getComments, getFeed, addFriendByCode, getFriends, getFriendProfile };
