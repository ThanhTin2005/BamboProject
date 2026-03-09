const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Ông chưa đăng nhập rồi!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token hết hạn hoặc không hợp lệ" });
        req.user = user; // Gắn thông tin user (id, username) vào request
        next();
    });
};