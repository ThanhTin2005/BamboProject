// userController là nơi xử lý các logic liên quan đến người dùng sau khi đã đăng nhập, như xem thông tin cá nhân, cập nhật hồ sơ, v.v. 
const db = require("../db"); // Đường dẫn tới file kết nối DB của ông
const uploadCloud = require("../config/cloudinaryConfig"); // Import cấu hình Cloudinary

// --- LẤY THÔNG TIN USER PROFILE ---
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      "SELECT user_id, username as name,  slogan, avatar_url, cover_url FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy Profile:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// --- CẬP NHẬT USER PROFILE ---
exports.updateProfile = async (req, res) => {
  try { 
    const userId = req.user.id; 
    const { name, slogan } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tên không được để trống" });
    }

    const [result] = await db.execute(
      "UPDATE users SET username = ?, slogan = ? WHERE user_id = ?",
      [name, slogan, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.json({ 
      message: "Cập nhật thành công!", 
      data: { username: name, slogan: slogan } 
    });
  } catch (error) {
    console.error("Lỗi cập nhật Profile:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// --- UPLOAD ẢNH AVATAR/COVER ---
exports.uploadImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const type  = req.body.type; // "avatar" hoặc "cover"

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không tìm thấy file ảnh" });
    }

    const imageUrl = req.file.path; // Đường dẫn ảnh sau khi upload lên Cloudinary
    let sql = "";
    let updateField = "";

    if (type === "avatar") {
      updateField = "avatar_url";
    } else if (type === "cover") {
      updateField = "cover_url";
    } else {
      return res.status(400).json({ success: false, message: "Loại ảnh không hợp lệ (phải là \"avatar\" hoặc \"cover\")" });
    }
    
    sql = `UPDATE users SET ${updateField} = ? WHERE user_id = ?`;
    await db.execute(sql, [imageUrl, userId]);

    res.json({ success: true, message: "Upload ảnh thành công!", imageUrl });

  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    res.status(500).json({ success: false, message: "Lỗi Server khi upload ảnh" });
  }
};

// --- TÌM KIẾM NGƯỜI DÙNG THEO TÊN ---
exports.searchUsers = async (req, res) => {
    const { name } = req.query; // Lấy từ khóa ?name=... từ URL
    const currentUserId = req.user.id; // Để tránh tìm ra chính mình

    try {
        if (!name) return res.json([]); // Nếu chưa gõ gì thì trả về mảng rỗng

        const [users] = await db.execute(
            "SELECT user_id, name, avatar_url, slogan FROM users WHERE name LIKE ? AND user_id != ?",
            [`%${name}%`, currentUserId]
        );// Câu SQL này sẽ tìm những người dùng có tên chứa từ khóa và không phải là chính mình
        res.json(users);
    } catch (error) {
        console.error("Lỗi searchUsers:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi tìm kiếm!" });
    }
};