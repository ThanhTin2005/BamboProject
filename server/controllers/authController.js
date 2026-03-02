//authController.js dùng để mã hoá mật khẩu trước khi lưu vào db và giải mã khi đăng nhập 
const bcrypt = require('bcryptjs');//Đây là thư viện dùng để mã hoá mật khẩu trước khi được vào DB 
const db = require('../db'); // File kết nối DB từ Ngày 1

exports.register = async (req, res) => {//Hàm bất đồng bộ (async ) vì việc mã hoá đưa vào DB cần thời gian chờ 
    //async có nghĩa là : "hãy làm việc này đi , nhưng đừng ngồi đợi nó xong rồi mới làm việc khác , cứ làm việc tiếp theo , khi nào xong thì báo lại cho tôi "
    //Xuất hàm register này để các file khác (như file routes) có thể sử dụng  
    const { username, password } = req.body;
    //ơ khoan nhưng lúc đăng ký đã làm gì có username và password đâu, nên trong req làm sao mà có username và password được 
    //à , req này chính là lúc mà sau khi người dùng đã điền các thông tin vào rồi ý , sau khi điền thông tin xong thì người dùng nhấn nút đăng ký và gửi req cho server 
    try {
        // 1. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Lưu vào MySQL
        const query = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
        await db.query(query, [username, password_hash]);

        res.status(201).json({ message: "Đăng ký thành công cho " + username });
    } catch (err) {
        res.status(500).json({ error: "Lỗi đăng ký: " + err.message });
    }
};

const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    //Lý do req có username và pass là vì người dùng nhập các thông tin trên , khi nhấn nút đăng nhập thì req sẽ được gửi đến server 

    try {
        // 1. Tìm người dùng trong Database
        const query = 'SELECT * FROM users WHERE username = ?';
        const [users] = await db.query(query, [username]);
        //users sẽ là một mảng , chưa danh sách các user có giá trị username = username 

        if (users.length === 0) {
            return res.status(401).json({ error: "Tài khoản không tồn tại" });
        }

        const user = users[0];//database user thì thuộc tính username là unique nên chỉ có tối đa một phần tử đối với một cái tên 

        // 2. So sánh mật khẩu (Mật khẩu nhập vào vs Mật khẩu đã hash trong DB)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Mật khẩu không chính xác" });
        }

        // 3. Tạo JWT Token
        const token = jwt.sign(
            { id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 4. Trả về Token và thông tin cơ bản
        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.user_id,
                username: user.username,
                avatar: user.avatar_url
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
    }
};

