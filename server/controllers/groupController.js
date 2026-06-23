const db = require('../db');

// 1. API Tạo Nhóm
// POST /api/groups
exports.createGroup = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; // Lấy từ middleware auth xác thực JWT
    // ⚡ Lấy link ảnh từ Cloudinary, nếu user lười không chọn thì đắp ảnh mặc định
    const groupImage = req.file ? req.file.path : 'https://via.placeholder.com/150';

    if (!title) {
        return res.status(400).json({ message: 'Tên nhóm không được để trống.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Thêm vào bảng groups
        const [groupResult] = await connection.query(
            'INSERT INTO `groups` (title,group_image, description) VALUES (?, ?, ?)', 
            [title, groupImage, description]
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
        
        // ⚡ Đã thêm g.group_image và truy vấn đếm số lượng thành viên thực tế
        const [groups] = await connection.query(`
            SELECT 
                g.group_id, 
                g.title, 
                g.description, 
                g.group_image, 
                gm.role,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) AS member_count
            FROM group_members gm 
            JOIN \`groups\` g ON gm.group_id = g.group_id 
            WHERE gm.user_id = ? 
            ORDER BY gm.joined_at DESC
        `, [userId]);

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

// PUT /api/groups/:groupId/logs/:logId/review , API kiểm tra quyền Leader và duyệt bài (verified/rejected)
exports.reviewGroupLog = async (req, res) => {
    const { groupId, logId } = req.params;
    const { status } = req.body; // Bắt buộc là 'verified' hoặc 'rejected'
    const userId = req.user.id;

    let connection;
    try {
        connection = await db.getConnection();
        
        // 1. Kiểm tra xem thằng đang gọi API có phải là Leader không?
        const [checkRole] = await connection.query(`
            SELECT role FROM group_members 
            WHERE group_id = ? AND user_id = ?
        `, [groupId, userId]);

        if (checkRole.length === 0 || checkRole[0].role !== 'leader') {
            return res.status(403).json({ message: 'Ông không có quyền Leader để duyệt bài!' });
        }

        // 2. Cập nhật trạng thái
        await connection.query(`
            UPDATE logs SET status = ? WHERE log_id = ? AND group_id = ?
        `, [status, logId, groupId]);

        res.status(200).json({ message: `Đã ${status === 'verified' ? 'duyệt' : 'từ chối'} minh chứng!` });
    } catch (error) {
        console.error('Lỗi duyệt bài:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi duyệt bài.' });
    } finally {
        if (connection) connection.release();
    }
};
// GET /api/groups/:groupId/gallery - API Lấy thư viện ảnh (Chỉ ảnh đã duyệt)
exports.getGroupGallery = async (req, res) => {
    const { groupId } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        
        // ⚡ Điều kiện gắt: Chỉ lấy ảnh có status là 'verified' hoặc 'auto_approved'
        const [gallery] = await connection.query(`
            SELECT log_id, image_url, created_at 
            FROM logs 
            WHERE group_id = ? AND status IN ('verified')
            ORDER BY created_at DESC
        `, [groupId]);

        res.status(200).json({ data: gallery });
    } catch (error) {
        console.error('Lỗi lấy gallery nhóm:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tải thư viện ảnh.' });
    } finally {
        if (connection) connection.release();
    }
};
exports.deleteGroup = async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id; 

    try {
        // 1. Kiểm tra xem người xóa có phải là Leader không
        const [members] = await db.query(
            'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?', 
            [groupId, userId]
        );

        if (members.length === 0 || members[0].role !== 'leader') {
            return res.status(403).json({ message: "Chỉ Trưởng nhóm mới có quyền giải tán khế ước này." });
        }

        // 2. Chém nhóm (DB sẽ tự xóa các bảng con nếu có cài khóa ngoại ON DELETE CASCADE)
        await db.query('DELETE FROM `groups` WHERE group_id = ?', [groupId]);

        res.json({ message: "Đã giải tán nhóm thành công." });
    } catch (error) {
        console.error("Lỗi xóa nhóm:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi xóa nhóm." });
    }
};