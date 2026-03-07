//authController.js dùng để mã hoá mật khẩu trước khi lưu vào db và giải mã khi đăng nhập 
const bcrypt = require('bcryptjs');//Đây là thư viện dùng để mã hoá mật khẩu trước khi được vào DB 
const db = require('../db'); // File kết nối DB từ Ngày 1
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
    // 1. Lấy dữ liệu và gọt giũa ngay lập tức
    const username = req.body.username ? req.body.username.trim().toLowerCase() : "";
    const password = req.body.password ? req.body.password.trim() : "";

    if (!username || !password) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ tên và mật khẩu" });
    }

    try {
        // Kiểm tra xem username đã tồn tại chưa (Bước này cực quan trọng)
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Tên tài khoản này đã có người dùng" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
        await db.query(query, [username, password_hash]);

        res.status(201).json({ message: "Đăng ký thành công cho " + username });
    } catch (err) {
        res.status(500).json({ error: "Lỗi đăng ký: " + err.message });
    }
};


exports.login = async (req, res) => {
    // 1. Làm sạch dữ liệu đầu vào giống hệt lúc Register
    const username = req.body.username ? req.body.username.trim().toLowerCase() : "";
    const password = req.body.password ? req.body.password.trim() : "";

    try {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [users] = await db.query(query, [username]);

        if (users.length === 0) {
            return res.status(401).json({ error: "Tài khoản không tồn tại" });
        }

        const user = users[0];
        
        // 2. So sánh mật khẩu đã được trim
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Mật khẩu không chính xác" });
        }

        // 3. Tạo JWT (Giữ nguyên đoạn cũ của ông)
        const token = jwt.sign(
            { id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: { id: user.user_id, username: user.username }
        });

    } catch (err) {
        res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
    }
};