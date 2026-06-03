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
        u.name AS creator_name,
        u.avatar_url AS creator_avatar
      FROM logs l
      -- 1. JOIN với bảng goals để check điều kiện công khai và lấy tiêu đề mục tiêu
      JOIN goals g ON l.goal_id = g.goal_id
      -- 2. JOIN với bảng users để lấy thông tin avatar, tên của người viết log
      JOIN users u ON l.user_id = u.user_id
      WHERE 
        g.is_public = 1 -- Điều kiện 1: Goal chứa log này phải được công khai
        -- Điều kiện 2: Chủ nhân của log phải là người mà user hiện tại đang follow
        AND l.user_id IN (
          SELECT following_id FROM followers WHERE follower_id = ?
        )
      -- Nhật ký mới nhất của bạn bè lên đầu bảng tin
      ORDER BY l.created_at DESC;
    `;

    // Thực thi câu lệnh query với db (hãy chắc chắn đầu file ông đã require biến db/pool kết nối MySQL nhé)
    const [feedItems] = await db.execute(query, [userId]);

    // Trả dữ liệu mượt mà về cho Frontend
    res.json(feedItems);

  } catch (error) {
    console.error("Lỗi khi lấy Bảng tin social feed:", error);
    res.status(500).json({ error: "Không thể tải bảng tin lúc này!" });
  }
};

module.exports = { toggleFollow, toggleLike, addComment, getComments, getFeed };
