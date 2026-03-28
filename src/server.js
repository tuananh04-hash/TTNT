require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); 
const http = require('http');
const { Server } = require('socket.io');

const { seedData } = require('./seeder/seedData'); 
const createTables = require('./migration/create_tables');
const db = require('./config/db');
const webRouter = require('./router/web'); 

const app = express();
const server = http.createServer(app);

// 1. KHỞI TẠO SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// 2. CẤU HÌNH MIDDLEWARE (ĐẶT TRƯỚC ROUTER)
app.use(cors()); 

// Tăng giới hạn Payload để nhận được mảng nhiều ảnh Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 3. ĐỊNH NGHĨA ROUTER API
app.use('/api/v1', webRouter); 

// 4. QUẢN LÝ KẾT NỐI REAL-TIME
io.on('connection', (socket) => {
    console.log('⚡ Một thiết bị đã kết nối:', socket.id);

    socket.on('join_conversation', (email) => {
        socket.join(email);
        console.log(`👤 Khách hàng ${email} đã vào phòng chat riêng.`);
    });

    socket.on('customer_send_message', (data) => {
        io.emit('admin_receive_message', data);
        io.to(data.email).emit('new_message', {
            sender_type: 'customer',
            message_text: data.message
        });
    });

    socket.on('admin_send_reply', (data) => {
        io.to(data.customer_email).emit('new_message', {
            sender_type: 'admin',
            message_text: data.message
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Một người dùng đã ngắt kết nối');
    });
});

// 5. KHỞI TẠO HỆ THỐNG
const startServer = async () => {
    try {
        await db.query('SELECT 1');
        console.log('✅ Kết nối Database MySQL thành công!');

        if (typeof createTables === 'function') {
            await createTables();
        } else if (createTables.createTables) {
            await createTables.createTables();
        }

        await seedData();

        const PORT = process.env.PORT || 3030;
        const HOST_NAME = process.env.HOST_NAME || 'localhost';

        server.listen(PORT, HOST_NAME, () => {
            console.log(`🚀 Server chạy tại http://${HOST_NAME}:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Lỗi khởi động hệ thống:', err);
        process.exit(1);
    }
};

startServer();