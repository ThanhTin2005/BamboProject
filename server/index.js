const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import controllers (Sẽ tạo ở bước 2)
const authController = require('./controllers/authController');

// --- ROUTES ---

// Route test server
app.get('/', (req, res) => {
    res.send('Bambo Server is running! 🎍');
});

// Auth Routes (Ngày 3 & Ngày 4)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login); // http://localhost:3000/api/login

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});