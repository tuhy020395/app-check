// Script test API bằng Node.js
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const SERVER_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const MAX_RETRIES = 10;
const RETRY_DELAY = 500; // milliseconds

let serverProcess = null;

// Hàm kiểm tra server có đang chạy không
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${SERVER_URL}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Hàm đợi server sẵn sàng
async function waitForServer() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    if (await checkServerRunning()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }
  return false;
}

// Hàm khởi động server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Đang khởi động server...');
    serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
      stdio: 'pipe',
      detached: false
    });

    let serverOutput = '';
    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
      if (serverOutput.includes('Server đang chạy')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout sau 5 giây
    setTimeout(() => {
      if (!serverOutput.includes('Server đang chạy')) {
        reject(new Error('Server không khởi động được trong thời gian cho phép'));
      }
    }, 5000);
  });
}

// Hàm dừng server
function stopServer() {
  if (serverProcess) {
    console.log('\n🛑 Đang dừng server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// Hàm chạy test
async function runTest() {
  const testData = {
    deviceId: 'test-device-123'
  };

  const postData = JSON.stringify(testData);

  const options = {
    hostname: 'localhost',
    port: SERVER_PORT,
    path: '/api/device',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Đang test API POST /api/device...');
  console.log('Gửi data:', testData);

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n=== Response ===');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(data);
        }
        
        if (res.statusCode === 200) {
          console.log('\n✅ Test thành công!');
          resolve(true);
        } else {
          console.log('\n❌ Test thất bại!');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Lỗi khi gọi API:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Hàm main
async function main() {
  let shouldStopServer = false;

  try {
    // Kiểm tra xem server có đang chạy không
    const isRunning = await checkServerRunning();
    
    if (!isRunning) {
      // Nếu server chưa chạy, tự động khởi động
      shouldStopServer = true;
      await startServer();
      console.log('✅ Server đã khởi động');
      
      // Đợi server sẵn sàng
      const isReady = await waitForServer();
      if (!isReady) {
        throw new Error('Server không phản hồi sau khi khởi động');
      }
    } else {
      console.log('✅ Server đã đang chạy');
    }

    // Chạy test
    await runTest();
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    // Dừng server nếu đã tự động khởi động
    if (shouldStopServer) {
      stopServer();
    }
    process.exit(0);
  }
}

// Xử lý tín hiệu dừng
process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

// Chạy main
main();
