const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import các bảng chỉ dẫn (Routes)
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');


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

app.use('/api/goals', goalRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));