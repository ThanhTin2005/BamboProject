const db = require('../db');

exports.createLog = async (req, res) => {
    try {
        // 1. Lấy user_id từ token (do middleware authenticateToken cung cấp)
        const user_id = req.user.id; 
        
        // 2. Lấy các text data từ body
        const { goal_id, caption, mood } = req.body; 
        
        // 3. Lấy link ảnh từ Cloudinary (nếu người dùng có upload ảnh)
        const image_url = req.file ? req.file.path : null; 

        // 4. Validate nhẹ nhàng
        if (!goal_id) {
            return res.status(400).json({ error: "Thiếu goal_id rồi ông giáo ơi!" });
        }

        // 5. Lưu vào Database
        const query = 'INSERT INTO logs (user_id, goal_id, caption, image_url, mood) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [user_id, goal_id, caption, image_url, mood]);

        // 6. Trả về kết quả cho App
        res.status(201).json({ 
            message: "Check-in thành công! Mầm tre đã lớn thêm một chút. 🌱",
            log: { user_id, goal_id, caption, image_url, mood }
        });

    } catch (err) {
        console.error("❌ Lỗi chi tiết Day 16:", err.message, err); 
        res.status(500).json({ error: err.message });
    }
};

exports.getLogsByGoal = async (req, res) => {
    const { goal_id } = req.params; // Lấy ID mục tiêu từ URL
    const user_id = req.user.id;    // Lấy ID người dùng từ Token để bảo mật (Hiện tại xem bạn bè thì không ép điều kiện user_id nữa)

    try {
        // ⚡ ĐÃ CẬP NHẬT: Đổi SELECT * thành câu lệnh lấy kèm chuỗi danh sách Avatar
        const query = `
            SELECT 
                l.*,
                -- ⚡ BỐC CHUỖI AVATAR: Nối các link ảnh của những người đã bump lại cách nhau bằng dấu phẩy
                (SELECT GROUP_CONCAT(u.avatar_url SEPARATOR ',') 
                 FROM fist_bumps fb 
                 JOIN users u ON fb.user_id = u.user_id 
                 WHERE fb.log_id = l.log_id) AS reactor_avatars
            FROM logs l 
            WHERE l.goal_id = ? 
            ORDER BY l.created_at DESC
        `;
        const [logs] = await db.query(query, [goal_id]);

        res.status(200).json({
            message: "Lấy nhật ký thành công!",
            data: logs
        });
    } catch (err) {
        console.error("Lỗi Day 17 nâng cấp:", err);
        res.status(500).json({ error: "Không lấy được nhật ký rồi Tín ơi!" });
    }
};