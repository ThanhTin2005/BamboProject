const db = require('../db');

// 1. API Tạo Nhóm
// POST /api/groups
exports.createGroup = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; // Lấy từ middleware auth xác thực JWT

    if (!title) {
        return res.status(400).json({ message: 'Tên nhóm không được để trống.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Thêm vào bảng groups
        const [groupResult] = await connection.query(
            'INSERT INTO `groups` (title, description) VALUES (?, ?)',
            [title, description]
        );
        const groupId = groupResult.insertId;

        // Thêm người tạo làm Leader
        await connection.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [groupId, userId, 'leader']
        );

        await connection.commit();
        res.status(201).json({
            message: 'Tạo nhóm thành công!',
            group: { id: groupId, title, description, role: 'leader' }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error in createGroup:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tạo nhóm.' });
    } finally {
        connection.release();
    }
};

// 2. API Tham Gia Nhóm (Khóa cứng quy mô tối đa 4 người)
// POST /api/groups/join
exports.joinGroup = async (req, res) => {
    const { groupId } = req.body;
    const userId = req.user.id;

    if (!groupId) {
        return res.status(400).json({ message: 'Thiếu mã ID nhóm (groupId).' });
    }

    try {
        // Kiểm tra sự tồn tại của nhóm
        const [groupCheck] = await db.query('SELECT * FROM `groups` WHERE group_id = ?', [groupId]);
        if (groupCheck.length === 0) {
            return res.status(404).json({ message: 'Nhóm không tồn tại.' });
        }

        // Kiểm tra xem đã tham gia chưa
        const [memberCheck] = await db.query(
            'SELECT * FROM `group_members` WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        if (memberCheck.length > 0) {
            return res.status(400).json({ message: 'Ông đã là thành viên của nhóm này rồi.' });
        }

        // Kiểm tra số lượng thành viên hiện tại (Giới hạn 4 người)
        const [countResult] = await db.query(
            'SELECT COUNT(*) as memberCount FROM `group_members` WHERE group_id = ?',
            [groupId]
        );
        
        if (countResult[0].memberCount >= 4) {
            return res.status(400).json({ message: 'Nhóm đã đạt giới hạn tối đa 4 người!' });
        }

        // Tiến hành thêm thành viên mới
        await db.query(
            'INSERT INTO `group_members` (group_id, user_id, role) VALUES (?, ?, ?)',
            [groupId, userId, 'member']
        );

        res.status(200).json({ 
            message: 'Tham gia nhóm thành công!',
            group: { id: groupId, title: groupCheck[0].title, role: 'member' }
        });
    } catch (error) {
        console.error('Error in joinGroup:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tham gia nhóm.' });
    }
};
// GET /api/groups/my-groups
exports.getMyGroups = async (req, res) => {
    const userId = req.user.id;
    let connection;
    try {
        connection = db.getConnection ? await db.getConnection() : db;
        
        // Lấy toàn bộ nhóm mà user đang tham gia
        const [groups] = await connection.query(
            'SELECT g.group_id, g.title, g.description, gm.role FROM group_members gm JOIN `groups` g ON gm.group_id = g.group_id WHERE gm.user_id = ? ORDER BY gm.joined_at DESC',
            [userId]
        );

        // Trả về mảng groups (nếu chưa có nhóm nào thì mảng rỗng [])
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Lỗi lấy danh sách nhóm:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tải danh sách nhóm.' });
    } finally {
        if (connection && connection.release) connection.release();
    }
};
// POST /api/groups/:groupId/logs - Nộp minh chứng vào nhóm
exports.submitGroupLog = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { caption, mood } = req.body;
    
    // Tương tự log cá nhân, lấy URL ảnh từ middleware Cloudinary/Multer
    const imageUrl = req.file ? req.file.path : null; 

    if (!imageUrl) {
        return res.status(400).json({ message: 'Bắt buộc phải có ảnh minh chứng.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        // Ném vào DB với status mặc định là 'pending'
        await connection.query(`
            INSERT INTO logs (user_id, group_id, image_url, caption, mood, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `, [userId, groupId, imageUrl, caption, mood]);

        res.status(201).json({ message: 'Đã nộp minh chứng vào Bụi tre. Đang chờ duyệt!' });
    } catch (error) {
        console.error('Lỗi nộp minh chứng nhóm:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi nộp bài.' });
    } finally {
        if (connection) connection.release();
    }
};

// GET /api/groups/:groupId/timeline - Lấy danh sách bài trên Timeline
exports.getGroupTimeline = async (req, res) => {
    const { groupId } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        
        // Lấy tất cả bài của nhóm này, user mới nhất xếp lên đầu
        const [logs] = await connection.query(`
            SELECT l.*, u.username, u.avatar_url 
            FROM logs l 
            JOIN users u ON l.user_id = u.user_id 
            WHERE l.group_id = ?
            ORDER BY l.created_at DESC
        `, [groupId]);

        res.status(200).json({ data: logs });
    } catch (error) {
        console.error('Lỗi lấy timeline nhóm:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tải timeline.' });
    } finally {
        if (connection) connection.release();
    }
};