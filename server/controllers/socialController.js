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
  const userId = req.user.id; // ID của chính người dùng đang đăng nhập
  try {
    // ĐÃ CẬP NHẬT: Thêm subquery đếm để check xem mình đã tương tác chưa
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
            u.avatar_url AS creator_avatar,
            (SELECT EXISTS(SELECT 1 FROM fist_bumps WHERE log_id = l.log_id AND user_id = ?)) AS has_bumped
        FROM logs l
        -- TẦNG 1: KẾT NỐI DỮ LIỆU (JOIN)
        JOIN goals g ON l.goal_id = g.goal_id
        JOIN users u ON l.user_id = u.user_id
        -- TẦNG 2: BỘ LỌC KIỂU LOCKET (WHERE)
        WHERE 
            g.is_public = 1 
            -- 1. CHIỀU ĐI: Tôi phải follow người ta
            AND (
                -- ⚡ ĐIỀU KIỆN MỚI 1: Lấy bài của CHÍNH TÔI
                l.user_id = ? 
                
                OR 
                
                -- ⚡ ĐIỀU KIỆN MỚI 2: HOẶC lấy bài của Bạn bè tương tác 2 chiều
                (
                    l.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)
                    AND l.user_id IN (SELECT follower_id FROM followers WHERE following_id = ?)
                )
            )
        ORDER BY l.created_at DESC;
    `;

    // ⚡ QUAN TRỌNG: Truyền 3 lần userId tương ứng với 3 dấu ? theo thứ tự xuất hiện từ trên xuống
    const [feedItems] = await db.execute(query, [userId, userId, userId, userId]);

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
// [API] - ĐẤM TAY ĐỒNG ĐỘI (Giới hạn 3 lần/ngày)
// toggle - công tắc bật tắt
const toggleFistBump = async (req, res) => {
  const { logId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Check xem đã đấm tay bài này chưa
    const [existing] = await db.query(
      'SELECT bump_id FROM fist_bumps WHERE log_id = ? AND user_id = ?', 
      [logId, userId]
    );

    if (existing.length > 0) {
      // 2A. ĐÃ BẤM RỒI -> BẤM LẠI SẼ RÚT LẠI (Hoàn trả lượt)
      await db.query('DELETE FROM fist_bumps WHERE bump_id = ?', [existing[0].bump_id]);
      return res.status(200).json({ action: 'removed' });
    }

    // 2B. CHƯA BẤM -> KIỂM TRA GIỚI HẠN TRONG NGÀY
    const [todayUsage] = await db.query(
      'SELECT COUNT(*) AS count FROM fist_bumps WHERE user_id = ? AND DATE(created_at) = CURDATE()', 
      [userId]
    );

    if (todayUsage[0].count >= 3) {
      // ⚡ Bắn mã lỗi 400 để Frontend biết đường lắc rung Icon
      return res.status(400).json({ error: 'Limit reached' });
    }

    // 3. THỎA MÃN ĐIỀU KIỆN -> THÊM MỚI
    await db.query(
      'INSERT INTO fist_bumps (log_id, user_id) VALUES (?, ?)', 
      [logId, userId]
    );
    
    // ⚡ BẮN THÔNG BÁO TỰ ĐỘNG
      const [logOwner] = await db.query('SELECT user_id FROM logs WHERE log_id = ?', [logId]);
      const receiverId = logOwner[0].user_id;
      
      if (userId !== receiverId) { // Không thông báo nếu tự đấm mình
        await db.query(
          'INSERT INTO notifications (receiver_id, actor_id, action_type, reference_id) VALUES (?, ?, ?, ?)',
          [receiverId, userId, 'BUMP', logId]
        );
      }
    
    res.status(200).json({ action: 'added' });

  } catch (error) {
    console.error("Lỗi khi fist bump:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// [API] - GỬI LỜI NHẮN ĐỘNG VIÊN RIÊNG TƯ (Day 40)
const addPrivateComment = async (req, res) => {
  const senderId = req.user.id; // ID của mình lấy từ middleware protect
  const { logId, message } = req.body;

  // 1. Kiểm tra validation cơ bản
  if (!logId || !message || message.trim() === "") {
    return res.status(400).json({ error: "Lời nhắn không được để trống ông ơi!" });
  }

  if (message.length > 150) {
    return res.status(400).json({ error: "Lời nhắn quá dài, tối đa 150 ký tự thôi nè." });
  }

  try {
    // 2. Kiểm tra xem bài nhật ký (log) này có thật sự tồn tại không
    const [logCheck] = await db.query('SELECT user_id FROM logs WHERE log_id = ?', [logId]);
    if (logCheck.length === 0) return res.status(404).json({ error: "Bài log không tồn tại!" });

    const receiverId = logCheck[0].user_id; // Chủ bài log 

    // 3. Tiến hành lưu vào database bảng private_comments
    await db.query(
      'INSERT INTO private_comments (log_id, sender_id, message) VALUES (?, ?, ?)',
      [logId, senderId, message.trim()]
    );
    // ⚡ 2. BẮN THÔNG BÁO (Nếu mình không tự gửi cho chính mình)
    if (senderId !== receiverId) {
      await db.query(
        'INSERT INTO notifications (receiver_id, actor_id, action_type, reference_id) VALUES (?, ?, ?, ?)',
        [receiverId, senderId, 'COMMENT', logId]
      );
    }

    // 4. Trả về phản hồi thành công cho Frontend
    res.status(200).json({ message: "Đã lưu lời động viên bí mật! 💌" });

  } catch (error) {
    console.error("Lỗi khi thêm bình luận riêng tư:", error);
    res.status(500).json({ error: "Lỗi hệ thống server, vui lòng thử lại sau." });
  }
};

// [API] - LẤY DANH SÁCH THÔNG BÁO
const getNotifications = async (req, res) => {
  const myId = req.user.id;
  try {
    const query = `
      SELECT 
        n.notif_id, n.action_type, n.is_read, n.created_at, n.reference_id,
        u.username AS actor_name, u.avatar_url AS actor_avatar,
        g.title AS goal_title,
        (SELECT message FROM private_comments WHERE log_id = n.reference_id AND sender_id = n.actor_id ORDER BY created_at DESC LIMIT 1) AS comment_snippet
      FROM notifications n
      JOIN users u ON n.actor_id = u.user_id
      JOIN logs l ON n.reference_id = l.log_id
      JOIN goals g ON l.goal_id = g.goal_id
      WHERE n.receiver_id = ?
      ORDER BY n.created_at DESC
      LIMIT 30; -- Chỉ lấy 30 thông báo gần nhất cho nhẹ
    `;
    const [notifs] = await db.execute(query, [myId]);
    res.status(200).json(notifs);
  } catch (error) {
    res.status(500).json({ error: "Không thể lấy thông báo." });
  }
};

// [API] - ĐÁNH DẤU ĐÃ ĐỌC
const markNotificationRead = async (req, res) => {
  const { notifId } = req.params;
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE notif_id = ? AND receiver_id = ?', [notifId, req.user.id]);
    res.status(200).json({ message: "Đã đọc" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi update" });
  }
};

// [API] - LẤY CHI TIẾT BÀI VIẾT & MẢNH GIẤY BÍ MẬT (Log Detail)
const getLogDetail = async (req, res) => {
  const { logId } = req.params;
  const myId = req.user.id;

  try {
    // 1. Lấy thông tin bài Log
    const logQuery = `
      SELECT l.*, u.username, u.avatar_url, g.title AS goal_title, g.color AS goal_color
      FROM logs l
      JOIN users u ON l.user_id = u.user_id
      JOIN goals g ON l.goal_id = g.goal_id
      WHERE l.log_id = ?
    `;
    const [logs] = await db.query(logQuery, [logId]);

    if (logs.length === 0) {
      return res.status(404).json({ error: "Bài viết không tồn tại!" });
    }
    const logData = logs[0];

    // 2. Lấy "Mảnh giấy bí mật" (Bảo mật: Chỉ lấy nếu mình là chủ bài viết)
    let privateComments = [];
    if (logData.user_id === myId) {
      const commentQuery = `
        SELECT c.message, u.username, c.created_at
        FROM private_comments c
        JOIN users u ON c.sender_id = u.user_id
        WHERE c.log_id = ?
        ORDER BY c.created_at DESC
      `;
      const [comments] = await db.query(commentQuery, [logId]);
      privateComments = comments;
    }

    // Trả về cả 2 data
    res.status(200).json({ log: logData, privateComments });
  } catch (error) {
    console.error("Lỗi getLogDetail:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
module.exports = { toggleFollow, toggleLike, addComment, getComments, getFeed, addFriendByCode, getFriends, getFriendProfile, toggleFistBump,addPrivateComment ,getNotifications, markNotificationRead, getLogDetail };
