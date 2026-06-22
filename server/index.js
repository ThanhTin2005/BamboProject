const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import các bảng chỉ dẫn (Routes)
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const userRoutes = require('./routes/userRoutes');
const socialRoutes = require('./routes/socialRoutes'); // Thêm dòng này
const groupRoutes = require('./routes/groupRoutes'); // Thêm dòng này

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- SỬ DỤNG ROUTES ---
// Tất cả các route trong authRoutes sẽ bắt đầu bằng tiền tố /api/auth
// Ví dụ: /api/auth/register hoặc /api/auth/login
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Bambo Server is ready! 🎍');
});

app.use('/api/goals', goalRoutes);// Thêm dòng này vào phần cấu hình routes
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/users', userRoutes); // Route cho user profile, update, v.v.
app.use('/api/social', socialRoutes); // Thêm dòng này
app.use('/api/groups', groupRoutes); // Thêm dòng này

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));