const db = require('../db');

// 1. Tạo mới Goal
// controllers/goalController.js
exports.createGoal = async (req, res) => {
    const { title, description, color } = req.body;
    
    // Nếu có file ảnh, Multer sẽ nhét thông tin vào req.file
    // Nếu không có, mình dùng cái cover_image_url (icon) gửi từ body
    const cover_image_url = req.file ? req.file.path : req.body.cover_image_url;

    try {
        const query = 'INSERT INTO goals (user_id, title, description, cover_image_url, color) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [req.user.id, title, description, cover_image_url, color]);
        res.status(201).json({ message: "Gieo mầm thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Lấy danh sách Goal của riêng User đó
exports.getGoals = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = 'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC';
        const [goals] = await db.query(query, [userId]);
        
        // Trả về mảng goals đã được bóc tách
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};