const db = require('../db');

// 1. Tạo mới Goal
exports.createGoal = async (req, res) => {
    const { title, description, cover_image_url } = req.body;
    const userId = req.user.id; // Lấy từ token đã verify ở middleware

    try {
        const query = 'INSERT INTO goals (user_id, title, description, cover_image_url) VALUES (?, ?, ?, ?)';
        await db.query(query, [userId, title, description, cover_image_url]);
        res.status(201).json({ message: "Đã gieo mầm thói quen mới! 🎍" });
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
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};