const connectDB = require('../config/db');

// =========================================
// I. SERVICE CHO NGƯỜI DÙNG (USER)
// =========================================

const getallUsers = async () => {
    try {
        // SELECT tất cả nhưng có thể sắp xếp theo ID mới nhất lên đầu
        const [results] = await connectDB.query('SELECT * FROM Users ORDER BY id DESC');
        return results;
    } catch (error) {
        console.error("❌ Lỗi getallUsers Service:", error);
        throw error; // Quăng lỗi ra để Controller bắt được và trả về status 500
    }
};

// =========================================
// II. SERVICE CHO SẢN PHẨM (PRODUCT)
// =========================================

const getallProducts = async () => {
    try {
        const [results] = await connectDB.query('SELECT * FROM products ORDER BY id DESC');
        return results;
    } catch (error) {
        console.error("❌ Lỗi getallProducts Service:", error);
        throw error;
    }
};

// Export theo cách ngắn gọn (ES6 shorthand)
module.exports = {
    getallUsers,
    getallProducts,
};