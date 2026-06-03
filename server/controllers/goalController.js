const db = require('../db');

// 1. Tạo mới Goal
// controllers/goalController.js
// exports.createGoal = async (req, res) => {
//     const { title, description, color, is_public } = req.body;
//     const is_public = req.body.is_public === 'true' || req.body.is_public === true ? 1 : 0;    
//     // Nếu có file ảnh, Multer sẽ nhét thông tin vào req.file
//     // Nếu không có, mình dùng cái cover_image_url (icon) gửi từ body
//     const cover_image_url = req.file ? req.file.path : req.body.cover_image_url;

//     try {
//         const query = 'INSERT INTO goals (user_id, title, description, cover_image_url, color, is_public) VALUES (?, ?, ?, ?, ?, ?)';
//         await db.query(query, [req.user.id, title, description, cover_image_url, color, is_public]);
//         res.status(201).json({ message: "Gieo mầm thành công!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
exports.createGoal = async (req, res) => {
    // 1. GIẢI QUYẾT BẪY DỮ LIỆU: Ép chuỗi 'true'/'false' từ FormData thành số 1 hoặc 0 cho MySQL
    const is_public = req.body.is_public === 'true' || req.body.is_public === true ? 1 : 0;
    
    const title = req.body.title;
    const description = req.body.description;
    const color = req.body.color;

    // 2. ĐỒNG BỘ XỬ LÝ ẢNH/ICON: Nếu có file upload thì lấy path, không thì lấy icon từ body
    const cover_image_url = req.file ? req.file.path : req.body.cover_image_url;

    try {
        const userId = req.user.id; // Lấy ID của User đăng nhập từ middleware protect

        // 3. THỰC THI LỆNH INSERT CHUẨN CHỈNH
        // (Hãy đảm bảo biến kết nối 'db' trùng khớp với tên biến trong file của ông, ví dụ: pool hoặc connection)
        const [result] = await db.execute(
            "INSERT INTO goals (user_id, title, description, cover_image_url, color, is_public) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, title, description, cover_image_url, color, is_public]
        );

        res.status(201).json({ 
            message: "Tạo mục tiêu thành công! 🎉", 
            goalId: result.insertId 
        });
    } catch (error) {
        console.error("Lỗi tạo mục tiêu tại Backend:", error);
        res.status(500).json({ error: error.message });
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

// 3. Chỉnh sửa Goal
exports.updateGoal = async (req, res) => {
    // 1. CHỐNG LỖI LỆCH TÊN PARAMETER: Lấy cả id hoặc goalId từ URL
    const goalId = req.params.id || req.params.goalId;
    
    // 2. CHỐNG LỖI ÉP KIỂU FORMDATA: Ép chuỗi 'true'/'false' thành số 1 và 0 cho MySQL
    const title = req.body.title;
    const description = req.body.description;
    const color = req.body.color;
    const is_public = req.body.is_public === 'true' || req.body.is_public === true ? 1 : 0;

    // Lấy ảnh từ req.file nếu có upload mới, không thì giữ nguyên ảnh cũ từ body
    const cover_image_url = req.file ? req.file.path : req.body.cover_image_url;

    try {
        // 3. SỬA LẠI TÊN CỘT: Đổi 'is_public = ?' và cột khóa chính thành 'goal_id = ?'
        let query = 'UPDATE goals SET title = ?, description = ?, color = ?, is_public = ?';
        const params = [title, description, color, is_public];

        if (cover_image_url) {
            query += ', cover_image_url = ?';
            params.push(cover_image_url);
        }

        // Sửa 'id = ?' thành 'goal_id = ?' cho khớp với Database
        query += ' WHERE goal_id = ? AND user_id = ?';
        params.push(goalId, req.user.id);

        // Dùng db.execute thay vì db.query để tối ưu hóa Prepared Statement
        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy mục tiêu hoặc bạn không có quyền chỉnh sửa!" });
        }

        res.json({ message: "Cập nhật mục tiêu thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật mục tiêu Backend:", err);
        res.status(500).json({ error: err.message });
    }
};
// exports.updateGoal = async (req, res) => {
//     const { goalId } = req.params;
//     const { title, description, color, is_public } = req.body;

//     // Tương tự, nếu có ảnh mới upload, sẽ lấy từ req.file, không thì lấy cover_image_url từ body
//     const cover_image_url = req.file ? req.file.path : req.body.cover_image_url;

//     try {
//         let query = 'UPDATE goals SET title = ?, description = ?, color = ?, is_public = ?';
//         const params = [title, description, color, is_public];

//         if (cover_image_url) {
//             query += ', cover_image_url = ?';
//             params.push(cover_image_url);
//         }

//         query += ' WHERE goal_id = ? AND user_id = ?';
//         params.push(goalId, req.user.id);

//         const [result] = await db.query(query, params);

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Không tìm thấy mục tiêu hoặc bạn không có quyền chỉnh sửa!" });
//         }

//         res.json({ message: "Cập nhật mục tiêu thành công!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
// API lấy chi tiết 1 mục tiêu dựa vào goalID , dùng để xem chi tiết mục tiêu hoặc sửa mục tiêu đó (điền sẵn thông tin cũ vào form)
exports.getGoalById = async (req, res) => {
  try {
    const { goalId } = req.params; // Lấy cái goalID từ trên URL xuống (ví dụ: /api/goals/5)
    
    // Truy vấn vào DB tìm đúng mục tiêu có goal_id đó
    const [rows] = await db.execute(
      "SELECT * FROM goals WHERE goal_id = ?", 
      [goalId]
    );

    // Nếu không tìm thấy dòng nào trong DB
    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy mục tiêu này trong hệ thống!" });
    }

    // Nếu tìm thấy, trả về đúng object mục tiêu đó (rows[0]) cho Mobile nhận dữ liệu
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy chi tiết mục tiêu:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
};


