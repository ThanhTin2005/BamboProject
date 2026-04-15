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
    const user_id = req.user.id;    // Lấy ID người dùng từ Token để bảo mật

    try {
        // Query lấy log, sắp xếp cái nào mới nhất thì lên đầu (DESC)
        const query = `
            SELECT * FROM logs 
            WHERE goal_id = ? AND user_id = ? 
            ORDER BY created_at DESC
        `;
        const [logs] = await db.query(query, [goal_id, user_id]);

        res.status(200).json({
            message: "Lấy nhật ký thành công!",
            data: logs
        });
    } catch (err) {
        console.error("Lỗi Day 17:", err);
        res.status(500).json({ error: "Không lấy được nhật ký rồi Tín ơi!" });
    }
};