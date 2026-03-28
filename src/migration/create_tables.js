const db = require('../config/db');

const initDatabase = async () => {
    try {
        // 1. Tạo bảng Users (Chữ thường cho đồng bộ)
        console.log('🔄 Đang tạo bảng users...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                city VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. Tạo bảng Products
        console.log('🔄 Đang tạo bảng products...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 3. Tạo bảng Brands
        console.log('🔄 Đang tạo bảng brands...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS brands (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                logo LONGTEXT,
                country VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 4. Tạo bảng Orders (Phải tạo sau cùng vì nó phụ thuộc vào users và products)
        console.log('🔄 Đang tạo bảng orders...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                total_amount DECIMAL(15, 2) NOT NULL,
                payment_method VARCHAR(50),
                status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
                shipping_address TEXT,
                phone_number VARCHAR(20),
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('🚀 TẤT CẢ BẢNG ĐÃ ĐƯỢC KHỞI TẠO THÀNH CÔNG!');

    } catch (error) {
        console.error('❌ Lỗi khởi tạo Database:', error);
        process.exit(1);
    }
};

module.exports = initDatabase;