const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { app, server } = require('./socket/index');

// Enable CORS with specific origin and credentials
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Define the port to listen on
const PORT = process.env.PORT || 8080;

// Route để kiểm tra server
app.get('/', (request, response) => {
  response.json({
    message: "server running at " + PORT
  });
});

// Ví dụ về việc gửi cookie token trong route login (thay thế token bằng giá trị thực tế)
app.post('/password', (request, response) => {
  const token = "sdhfsodufhdosiufhsdofidsofhsdoi"; // Bạn cần thay thế với cách tạo token của mình

  response.cookie('token', token, {
    httpOnly: true,  // Ngăn không cho JavaScript truy cập cookie
    secure: process.env.NODE_ENV === 'production',  // Cần sử dụng HTTPS khi môi trường là production
    maxAge: 1000 * 60 * 60 * 24,  // Cookie hết hạn sau 1 ngày
    sameSite: 'None',  // Cần thiết khi sử dụng CORS với các domain khác nhau
  });

  response.json({ message: "Login successful" });
});

// API endpoint
app.use('/api', router);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Kết nối đến cơ sở dữ liệu và khởi động server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });
});
