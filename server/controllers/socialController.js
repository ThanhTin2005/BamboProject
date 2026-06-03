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

module.exports = { toggleFollow, toggleLike, addComment, getComments, getFeed };
