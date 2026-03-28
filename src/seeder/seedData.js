const db = require('../config/db');

const seedData = async () => {
    try {
        console.log('🌱 Đang kiểm tra và thêm dữ liệu mẫu...');
        // ... (Giữ nguyên phần code seedData tôi đã sửa ở câu trước)
        console.log('🎉 Seed dữ liệu thành công!');
    } catch (error) {
        console.error('❌ Lỗi seed dữ liệu:', error);
    }
};

// ĐỊNH NGHĨA register TRƯỚC KHI EXPORT
const register = async (name, email, password) => {
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return { errorCode: 1, message: 'Email đã được sử dụng!' };
        }       
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
        return { errorCode: 0, message: 'Đăng ký thành công!' };
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        return { errorCode: 2, message: 'Lỗi server khi đăng ký!' };
    }
};

// ĐỊNH NGHĨA login TRƯỚC KHI EXPORT
const login = async (email, password) => {
    try {
        const [user] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (user.length === 0) {
            return { errorCode: 1, message: 'Email hoặc mật khẩu không đúng!' };
        }
        return { errorCode: 0, message: 'Đăng nhập thành công!', user: user[0] };
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return { errorCode: 2, message: 'Lỗi server khi đăng nhập!' };
    }
};

// BÂY GIỜ MỚI EXPORT
module.exports = { 
    seedData, 
    register, 
    login 
};