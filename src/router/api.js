const db = require('../config/db'); // Kiểm tra kỹ đường dẫn này
router.get('/suppliers', async (req, res) => {
    try {
        // Nếu db của bạn là Pool, dùng db.query hoặc db.execute
        const [rows] = await db.query("SELECT id, name FROM suppliers");
        res.json({ errorCode: 0, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorCode: 1, message: "Lỗi kết nối database" });
    }
});