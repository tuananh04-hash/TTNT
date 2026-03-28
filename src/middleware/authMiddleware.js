// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header

    if (!token) {
        return res.status(401).json({ errorCode: -1, message: "Bạn chưa đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY_CUA_BAN');
        req.user = decoded;
        next(); // Cho phép đi tiếp vào controller
    } catch (err) {
        return res.status(403).json({ errorCode: -1, message: "Phiên đăng nhập hết hạn!" });
    }
};

module.exports = { verifyAdmin };