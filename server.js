const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(); // lấy database từ URI
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connect error:', err);
  }
}

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/device', async (req, res) => {
  try {
    const { deviceId, user_name = '' } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId là bắt buộc'
      });
    }

    const result = await db.collection('devices').insertOne({
      deviceId,
      user_name,
      createdAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Lưu deviceId thành công',
      data: {
        id: result.insertedId,
        deviceId
      }
    });
  } catch (error) {
    console.error('Lỗi khi lưu device:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
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
