const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Debug nhanh: Kiểm tra xem server đã đọc được file .env chưa
// Nếu log ra là undefined thì bạn cần kiểm tra lại vị trí file .env
console.log("--- Kiểm tra cấu hình Mail ---");
console.log("Email:", process.env.EMAIL_USER);
console.log("Mật khẩu App:", process.env.EMAIL_PASS ? "Đã nhận mã ✅" : "Chưa nhận được (Rỗng) ❌");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Sử dụng SSL cho port 465
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: {
        // Bỏ qua lỗi chứng chỉ nếu chạy ở môi trường localhost
        rejectUnauthorized: false
    }
});

// Kiểm tra kết nối tới server mail ngay khi khởi động
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Lỗi cấu hình Mail (Kiểm tra lại Email/Pass App):", error.message);
    } else {
        console.log("✅ Hệ thống Mail đã sẵn sàng gửi OTP!");
    }
});

module.exports = transporter;