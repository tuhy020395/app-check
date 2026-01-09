const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err))

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API POST endpoint để nhận deviceId
app.post('/api/device', (req, res) => {
  try {
    const { deviceId } = req.body;

    // Kiểm tra deviceId có được gửi lên không
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId là bắt buộc'
      });
    }

    // Xử lý deviceId ở đây (ví dụ: lưu vào database, kiểm tra, etc.)
    console.log('Nhận được deviceId:', deviceId);

    // Trả về response thành công
    res.status(200).json({
      success: true,
      message: 'Nhận deviceId thành công',
      data: {
        deviceId: deviceId,
        receivedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Lỗi khi xử lý request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý request',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server đang chạy'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`API endpoint: POST http://localhost:${PORT}/api/device`);
});
