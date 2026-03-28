const db = require('../config/db');
const { getallUsers, getallProducts } = require('../services/CRUDservices');
const transporter = require('../config/mailer');
const jwt = require('jsonwebtoken'); 
// Helper function: Format kết quả trả về thống nhất
const sendResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        errorCode: (statusCode === 200 || statusCode === 201) ? 0 : -1,
        message: message,
        data: data
    });
};

// =========================================
// I. QUẢN LÝ NGƯỜI DÙNG (USER)
// =========================================

const getHomePage = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        if (searchTerm) {
            const [results] = await db.query(
                'SELECT * FROM Users WHERE name LIKE ? OR email LIKE ? OR city LIKE ?',
                [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
            );
            return sendResponse(res, 200, "Tìm kiếm người dùng thành công", results);
        }
        let results = await getallUsers();
        return sendResponse(res, 200, "Lấy danh sách người dùng thành công", results);
    } catch (error) {
        console.error("❌ Lỗi getHomePage:", error);
        return sendResponse(res, 500, "Lỗi server");
    }
};

const searchUsers = async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === "") {
        return res.json({ errorCode: 1, message: "Vui lòng nhập từ khóa!", data: [] });
    }
    try {
        const sql = `SELECT id, name, email, city, role FROM Users WHERE name LIKE ? OR email LIKE ? OR city LIKE ?`;
        const searchTerm = `%${query}%`;
        const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm]);
        return sendResponse(res, 200, "Tìm kiếm người dùng thành công", rows);
    } catch (error) {
        return sendResponse(res, 500, "Lỗi hệ thống khi tìm kiếm");
    }
};

const postCreateUser = async (req, res) => {
    const { name, email, city } = req.body;
    if (!name || !email) return sendResponse(res, 400, "Thiếu thông tin bắt buộc");
    try {
        await db.query('INSERT INTO Users (name, email, city) VALUES (?, ?, ?)', [name, email, city]);
        return sendResponse(res, 200, "Tạo người dùng thành công");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi khi lưu");
    }
};

const geteditPage = async (req, res) => {
    try {
        const userId = req.params.id;
        const [results] = await db.query('SELECT * FROM Users WHERE id = ?', [userId]);
        if (results.length > 0) return sendResponse(res, 200, "Thành công", results[0]);
        return sendResponse(res, 404, "Không tìm thấy");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi server");
    }
};

const postUpdateUser = async (req, res) => {
    const { email, name, city, userId } = req.body;
    try {
        await db.query('UPDATE Users SET email = ?, name = ?, city = ? WHERE id = ?', [email, name, city, userId]);
        return sendResponse(res, 200, "Cập nhật thành công");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi cập nhật");
    }
};

const deleteUser = async (req, res) => {
    const id = req.body.userId;
    try {
        await db.query('DELETE FROM Users WHERE id = ?', [id]);
        return sendResponse(res, 200, "Xóa thành công");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi khi xóa");
    }
};

const updateUserRole = async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) return sendResponse(res, 400, "Thiếu ID người dùng hoặc quyền hạn");
    try {
        const [result] = await db.query('UPDATE Users SET role = ? WHERE id = ?', [role, userId]);
        if (result.affectedRows === 0) return sendResponse(res, 404, "Không tìm thấy người dùng");
        return sendResponse(res, 200, "Cập nhật quyền hạn thành công");
    } catch (error) {
        console.error("❌ Lỗi updateUserRole:", error);
        return sendResponse(res, 500, "Lỗi hệ thống khi cập nhật quyền");
    }
};

// =========================================
// II. QUẢN LÝ SẢN PHẨM (PRODUCT)
// =========================================

// =========================================
// II. QUẢN LÝ SẢN PHẨM (PRODUCT) - ĐÃ FIX LỖI ẢNH
// =========================================

const getProductPage = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        if (searchTerm) {
            const [results] = await db.query(
                'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
                [`%${searchTerm}%`, `%${searchTerm}%`]
            );
            return sendResponse(res, 200, "Tìm kiếm thành công", results);
        }
        let products = await getallProducts();
        return sendResponse(res, 200, "Lấy danh sách thành công", products);
    } catch (error) {
        return sendResponse(res, 500, "Lỗi server");
    }
};
const postCreateProduct = async (req, res) => {
    // 1. Lấy thêm brand_id từ req.body gửi lên từ Frontend
    const { name, price, description, image, brand_id } = req.body; 

    try {
        // 2. Kiểm tra dữ liệu bắt buộc
        if (!name || !price || !brand_id) {
            return res.status(400).json({ 
                errorCode: 1, 
                message: "Thiếu thông tin bắt buộc (Tên, Giá hoặc Thương hiệu)" 
            });
        }

        // 3. Chuẩn hóa dữ liệu ảnh (Đảm bảo luôn là chuỗi JSON nếu là mảng)
        // Nếu Frontend đã stringify rồi thì để nguyên, nếu chưa thì stringify nó
        let finalImage = image;
        if (Array.isArray(image)) {
            finalImage = JSON.stringify(image);
        }

        // 4. Thực hiện câu lệnh SQL (Thêm cột brand_id)
        const query = "INSERT INTO products (name, price, description, image, brand_id) VALUES (?, ?, ?, ?, ?)";
        
        await db.query(query, [
            name, 
            Number(price), 
            description || '', 
            finalImage, 
            Number(brand_id) // Lưu ID của thương hiệu
        ]);

        return res.status(200).json({ 
            errorCode: 0, 
            message: "Thêm sản phẩm và thương hiệu thành công!" 
        });

    } catch (error) {
        console.error("Lỗi Controller postCreateProduct:", error);
        return res.status(500).json({ 
            errorCode: 1, 
            message: "Lỗi hệ thống khi thêm sản phẩm" 
        });
    }
};

const getEditProductPage = async (req, res) => {
    try {
        const productId = req.params.id;
        const [results] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (results.length > 0) return sendResponse(res, 200, "Thành công", results[0]);
        return sendResponse(res, 404, "Không tìm thấy");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi server");
    }
};

const postUpdateProduct = async (req, res) => {
    // Nhận cả 'id' và 'productId' để tránh lỗi không khớp tên biến từ Frontend
    const { id, productId, name, image, description, price } = req.body;
    const finalId = id || productId;

    try {
        // Fix: Quan trọng nhất - Phải stringify ảnh khi cập nhật
        let imageList = "";
        if (Array.isArray(image)) {
            imageList = JSON.stringify(image);
        } else if (typeof image === 'string' && image.startsWith('[')) {
            // Nếu đã là chuỗi JSON mảng thì giữ nguyên
            imageList = image;
        } else {
            imageList = JSON.stringify(image ? [image] : []);
        }

        const query = 'UPDATE products SET name = ?, price = ?, image = ?, description = ? WHERE id = ?';
        const [result] = await db.query(query, [name, price, imageList, description, finalId]);

        if (result.affectedRows === 0) return sendResponse(res, 404, "Sản phẩm không tồn tại");
        
        return sendResponse(res, 200, "Cập nhật sản phẩm thành công");
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        return sendResponse(res, 500, "Lỗi cập nhật hệ thống");
    }
};

const deleteProduct = async (req, res) => {
    const id = req.body.productId || req.body.id;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return sendResponse(res, 200, "Xóa thành công");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi khi xóa");
    }
};
// =========================================
// III. QUẢN LÝ THƯƠNG HIỆU (BRAND)
// =========================================

const getBrands = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM brands ORDER BY id DESC');
        return sendResponse(res, 200, "Lấy danh sách thành công", results);
    } catch (error) { return sendResponse(res, 500, "Lỗi server"); }
};

const postCreateBrand = async (req, res) => {
    const { name, logo, country, description } = req.body;
    if (!name) return sendResponse(res, 400, "Tên là bắt buộc");
    try {
        await db.query('INSERT INTO brands (name, logo, country, description) VALUES (?, ?, ?, ?)', 
            [name, logo || '', country || '', description || '']);
        return sendResponse(res, 200, "Thành công");
    } catch (error) { return sendResponse(res, 500, "Lỗi tạo"); }
};

const postUpdateBrand = async (req, res) => {
    const { id, name, logo, country, description } = req.body;
    try {
        await db.query('UPDATE brands SET name = ?, logo = ?, country = ?, description = ? WHERE id = ?', 
            [name, logo, country, description, id]);
        return sendResponse(res, 200, "Thành công");
    } catch (error) { return sendResponse(res, 500, "Lỗi cập nhật"); }
};

const deleteBrand = async (req, res) => {
    const { id } = req.body;
    try {
        await db.query('DELETE FROM brands WHERE id = ?', [id]);
        return sendResponse(res, 200, "Thành công");
    } catch (error) { return sendResponse(res, 500, "Lỗi xóa"); }
};

const searchBrands = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json({ errorCode: 1, data: [] });
    try {
        const [rows] = await db.execute('SELECT * FROM brands WHERE name LIKE ? OR country LIKE ?', [`%${query}%`, `%${query}%`]);
        return sendResponse(res, 200, "Thành công", rows);
    } catch (error) { return sendResponse(res, 500, "Lỗi"); }
};

// =========================================
// IV. QUẢN LÝ ĐƠN HÀNG (ORDER)
// =========================================

const getOrders = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM orders ORDER BY order_date DESC');
        return sendResponse(res, 200, "Thành công", results);
    } catch (error) { return sendResponse(res, 500, "Lỗi"); }
};

const updateOrderStatus = async (req, res) => {
    // Lấy id và status mới từ Frontend gửi lên
    const { id, status } = req.body; 

    try {
        // SQL phải khớp với tên cột 'status' trong bảng 'orders'
        const query = "UPDATE orders SET status = ? WHERE id = ?";
        const [result] = await db.query(query, [status, id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ 
                errorCode: 0, 
                message: "Cập nhật trạng thái đơn hàng thành công!" 
            });
        } else {
            return res.status(404).json({ errorCode: 1, message: "Không tìm thấy đơn hàng" });
        }
    } catch (error) {
        console.error("Lỗi UPDATE status:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi hệ thống" });
    }
};

const deleteOrder = async (req, res) => {
    const { orderId } = req.body;
    try {
        await db.query('DELETE FROM orders WHERE id = ?', [orderId]);
        return sendResponse(res, 200, "Thành công");
    } catch (error) { return sendResponse(res, 500, "Lỗi"); }
};

// =========================================
// V. XỬ LÝ THANH TOÁN & THỐNG KÊ (CHECKOUT & STATS)
// =========================================

const postCartCheckout = async (req, res) => {
    const { 
        user_id, 
        total_amount, 
        shipping_address, 
        cart 
    } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào (Chỉ kiểm tra các trường CSDL có hỗ trợ)
    if (!user_id || !cart || cart.length === 0 || !shipping_address) {
        return res.status(400).json({ 
            errorCode: 1, 
            message: "Vui lòng cung cấp đầy đủ thông tin giao hàng và giỏ hàng!" 
        });
    }

    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        // 2. Lưu vào bảng orders
        // Lưu ý: Chỉ chèn vào các cột ĐANG CÓ trong file SQL bạn gửi: 
        // user_id, total_amount, shipping_address, status
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_amount, shipping_address, status) 
             VALUES (?, ?, ?, 'pending')`,
            [user_id, total_amount, shipping_address]
        );

        const orderId = orderResult.insertId;

        // 3. Lưu vào bảng order_items
        for (let item of cart) {
            // SỬA: Đổi 'price_at_time' thành 'price' để khớp với bảng order_items trong SQL của bạn
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price) 
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.id, item.quantity, item.price]
            );

            // Tùy chọn: Trừ kho (nếu bạn muốn quản lý số lượng xe)
            await connection.query(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                [item.quantity, item.id]
            );
        }

        await connection.commit();
        return res.status(200).json({ errorCode: 0, message: "Đặt hàng thành công!" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Lỗi Backend 500 chi tiết:", error);
        return res.status(500).json({ 
            errorCode: 1, 
            message: "Lỗi hệ thống: " + error.sqlMessage 
        });
    } finally {
        if (connection) connection.release();
    }
};
const handlePostCheckout = async (req, res) => {
    try {
        const { user_id, total_amount, payment_method, address, phone_number, cart } = req.body;
        const sqlOrder = `INSERT INTO orders (user_id, total_amount, payment_method, status, shipping_address, phone_number, order_date) 
                          VALUES (?, ?, ?, 'Pending', ?, ?, NOW())`;
        const [result] = await db.query(sqlOrder, [user_id || null, total_amount, payment_method || 'cod', address, phone_number]);
        const orderId = result.insertId;

        if (cart && cart.length > 0) {
            const detailSql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;
            const values = cart.map(item => [orderId, item.id, item.quantity, item.price]);
            await db.query(detailSql, [values]);
        }
        return res.status(200).json({ errorCode: 0, message: "Đặt hàng thành công!", orderId: orderId });
    } catch (error) { return res.status(500).json({ errorCode: -1, message: "Lỗi lưu database" }); }
};

const getStatistics = async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) as total FROM users');
        const [ordersCount] = await db.query('SELECT COUNT(*) as total FROM orders');
        const [soldData] = await db.query(`
            SELECT SUM(oi.quantity) as totalSold FROM order_items oi
            JOIN orders o ON oi.order_id = o.id WHERE LOWER(o.status) = 'delivered'`);
        const [stockData] = await db.query('SELECT SUM(stock) as totalStock FROM products');
        const [revenueData] = await db.query(`
            SELECT MONTH(order_date) as month, SUM(total_amount) as amount FROM orders 
            WHERE LOWER(status) = 'delivered' AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY MONTH(order_date) ORDER BY MONTH(order_date) ASC`);

        const revenueArray = [];
        const currentMonth = new Date().getMonth() + 1;
        for (let i = 5; i >= 0; i--) {
            let targetMonth = currentMonth - i;
            if (targetMonth <= 0) targetMonth += 12;
            const found = revenueData.find(item => item.month === targetMonth);
            revenueArray.push(found ? Number(found.amount) : 0);
        }

        return res.status(200).json({
            errorCode: 0,
            data: {
                users: users[0].total || 0,
                orders: ordersCount[0].total || 0,
                soldQuantity: Number(soldData[0].totalSold || 0), 
                stockQuantity: Number(stockData[0].totalStock || 0),
                revenue: revenueArray
            }
        });
    } catch (error) { return res.status(500).json({ errorCode: 1, message: error.message }); }
};

// =========================================
// VI. PHẦN DÀNH CHO KHÁCH HÀNG (CLIENT SIDE)
// =========================================

const gethome = async (req, res) => {
    try {
        const [[newArrivals], [bestPrices]] = await Promise.all([
            db.execute('SELECT * FROM products ORDER BY id DESC LIMIT 4'),
            db.execute('SELECT * FROM products ORDER BY price ASC LIMIT 4')
        ]);
        return sendResponse(res, 200, "Thành công", { newArrivals, bestPrices });
    } catch (error) { return sendResponse(res, 500, "Lỗi hệ thống"); }
};

const getProductStore = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT p.*, b.name as brand_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id ORDER BY p.id DESC');
        return sendResponse(res, 200, "Thành công", rows);
    } catch (error) { return sendResponse(res, 500, "Lỗi"); }
};

const getProductDetail = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT p.*, b.name as brand_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?', 
            [req.params.id]
        );
        if (rows.length > 0) return sendResponse(res, 200, "Thành công", rows[0]);
        return sendResponse(res, 404, "Sản phẩm không tồn tại");
    } catch (error) { return sendResponse(res, 500, "Lỗi hệ thống"); }
};

const getProductsByBrand = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products WHERE brand_id = ?', [req.params.brandId]);
        return sendResponse(res, 200, "Thành công", rows);
    } catch (error) { return sendResponse(res, 500, "Lỗi"); }
};

const getProductsHome = async (req, res) => {
    try {
        const { name, brand, maxPrice, sort } = req.query;
        let sql = `SELECT p.*, b.name as brandName FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE 1=1`;
        let params = [];
        if (name) { sql += ` AND p.name LIKE ?`; params.push(`%${name}%`); }
        if (brand && brand !== 'All') { sql += ` AND b.name = ?`; params.push(brand); }
        if (maxPrice) { sql += ` AND p.price <= ?`; params.push(maxPrice); }
        sql += sort === 'priceLow' ? ` ORDER BY p.price ASC` : sort === 'priceHigh' ? ` ORDER BY p.price DESC` : ` ORDER BY p.id DESC`;
        const [products] = await db.execute(sql, params);
        return sendResponse(res, 200, "Thành công", products);
    } catch (error) { return sendResponse(res, 500, "Lỗi"); }
};

// =========================================
// VII. XÁC THỰC (AUTH)


const bcrypt = require('bcrypt');

const locgin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 2. Kiểm tra sự tồn tại của Email
        const [results] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ 
                errorCode: 1, 
                message: "Email không tồn tại trong hệ thống!" 
            });
        }

        const user = results[0];

        // 3. So sánh mật khẩu băm (hashed password)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                errorCode: 1, 
                message: "Mật khẩu bạn nhập không chính xác!" 
            });
        }

        // 4. Kiểm tra trạng thái xác thực (OTP)
        if (user.is_verified === 0) {
            return res.status(401).json({ 
                errorCode: 2, 
                message: "Tài khoản chưa xác thực OTP! Vui lòng kiểm tra email." 
            });
        }

        // 5. TẠO TOKEN (BƯỚC QUAN TRỌNG NHẤT)
        // Payload: Chứa thông tin cơ bản của user (không để mật khẩu ở đây)
        const payload = { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        };

    
        const secretKey = "TEN_BI_MAT_CUA_BAN_123"; 

        const token = jwt.sign(payload, secretKey, { 
            expiresIn: '24h' // Chìa khóa có hiệu lực trong 24 giờ
        });

        // 6. Xóa mật khẩu trước khi gửi dữ liệu về Frontend để bảo mật
        delete user.password;

        // 7. Trả về kết quả thành công kèm TOKEN
        return res.status(200).json({ 
            errorCode: 0, 
            message: "Đăng nhập thành công", 
            token: token, // <--- Frontend sẽ nhận cái này
            data: user 
        });

    } catch (error) { 
        console.error("Lỗi Login Server:", error); 
        return res.status(500).json({ 
            errorCode: 1, 
            message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau!" 
        }); 
    }
};

const register = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Kiểm tra thông tin đầu vào
    if (!name || !email || !password) {
        return sendResponse(res, 400, "Vui lòng nhập đầy đủ Name, Email và Password");
    }

    try {
        // 2. Kiểm tra Email đã tồn tại chưa
        const [exist] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
        if (exist.length > 0) {
            return sendResponse(res, 400, "Email này đã được đăng ký!");
        }

        // 3. Mã hóa mật khẩu (Bcrypt) và Tạo mã OTP 6 số
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Lưu User vào Database với trạng thái 'pending' và 'is_verified = 0'
        // Tuấn Anh nhớ chạy lệnh SQL ALTER TABLE trước khi chạy code này nhé
        const sql = `
            INSERT INTO Users (name, email, password, role, otp_code, is_verified, status) 
            VALUES (?, ?, ?, 'User', ?, 0, 'pending')
        `;
        await db.query(sql, [name, email, hashedPassword, otpCode]);

        // 5. Gửi Email chứa mã OTP (Giao diện đẹp)
        const mailOptions = {
            from: '"Tuấn Anh Store 🚲" <email_cua_ban@gmail.com>',
            to: email,
            subject: 'MÃ XÁC THỰC TÀI KHOẢN MỚI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 20px; text-align: center;">
                    <h2 style="color: #0071e3;">Xác Thực Email</h2>
                    <p>Chào <b>${name}</b>, cảm ơn bạn đã đăng ký tại Tuấn Anh Store.</p>
                    <p>Mã xác nhận OTP của bạn là:</p>
                    <div style="font-size: 32px; font-weight: 800; color: #ff4757; background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; letter-spacing: 5px;">
                        ${otpCode}
                    </div>
                    <p style="font-size: 12px; color: #888;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // 6. Trả về thành công (Frontend sẽ hiện ô nhập OTP)
        return sendResponse(res, 200, "Mã OTP đã được gửi về Email của bạn!");

    } catch (error) {
        console.error("❌ Lỗi Register:", error);
        return sendResponse(res, 500, "Lỗi hệ thống khi đăng ký");
    }
};
// VII. QUẢN LÝ KHO (INVENTORY)
// =========================================

// 1. Lấy danh sách phiếu nhập
const getInventoryReceipts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, s.name as supplier_name 
            FROM inventory_receipts r 
            JOIN suppliers s ON r.supplier_id = s.id 
            ORDER BY r.received_date DESC
        `);
        return sendResponse(res, 200, "Thành công", rows);
    } catch (e) { return sendResponse(res, 500, e.message); }
};

// 2. Tạo phiếu nhập kho (Khi xe mới về kho)
const postCreateReceipt = async (req, res) => {
    const { supplier_id, note, items } = req.body; 
    // items: [{product_id: 1, quantity: 5, import_price: 15000000}, ...]
    
    try {
        // Tính tổng tiền phiếu nhập
        const total_value = items.reduce((sum, item) => sum + (item.quantity * item.import_price), 0);

        // Lưu phiếu nhập chính
        const [result] = await db.execute(
            'INSERT INTO inventory_receipts (supplier_id, total_value, note) VALUES (?, ?, ?)',
            [supplier_id, total_value, note]
        );
        const receiptId = result.insertId;

        // Lưu chi tiết phiếu nhập
        for (const item of items) {
            await db.execute(
                'INSERT INTO inventory_receipt_details (receipt_id, product_id, quantity, import_price) VALUES (?, ?, ?, ?)',
                [receiptId, item.product_id, item.quantity, item.import_price]
            );
            // Trigger SQL phía trên sẽ tự động cộng 'stock' vào bảng products cho bạn
        }

        return sendResponse(res, 200, "Nhập kho thành công và đã cập nhật số lượng tồn!");
    } catch (e) { return sendResponse(res, 500, e.message); }
};

const getSuppliers = async (req, res) => {
    try {
        // Truy vấn lấy danh sách nhà cung cấp từ bảng suppliers
        const [rows] = await db.query("SELECT * FROM suppliers");
        
        return res.status(200).json({
            errorCode: 0,
            data: rows
        });
    } catch (error) {
        console.error("Lỗi Controller getSuppliers:", error);
        return res.status(500).json({
            errorCode: 1,
            message: "Lỗi server khi lấy danh sách nhà cung cấp"
        });
    }
};

// Lấy thông tin chi tiết của 1 user
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const [results] = await db.query('SELECT id, name, email, city, address, phone FROM Users WHERE id = ?', [userId]);
        if (results.length > 0) return sendResponse(res, 200, "Thành công", results[0]);
        return sendResponse(res, 404, "Không tìm thấy người dùng");
    } catch (error) {
        return sendResponse(res, 500, "Lỗi server");
    }
};

// Cập nhật thông tin profile
const updateProfile = async (req, res) => {
    // Nhận dữ liệu từ Frontend gửi lên qua req.body
    const { id, name, email, city, address, phone } = req.body;
    
    try {
        // Thực hiện câu lệnh SQL Update
        const query = 'UPDATE Users SET name = ?, email = ?, city = ?, address = ?, phone = ? WHERE id = ?';
        const [result] = await db.query(query, [name, email, city, address, phone, id]);

        if (result.affectedRows > 0) {
            // Trả về errorCode 0 để Frontend hiện Toast xanh
            return res.status(200).json({ 
                errorCode: 0, 
                message: "✅ Cập nhật thông tin thành công!" 
            });
        } else {
            return res.status(404).json({ errorCode: 1, message: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        console.error("❌ Lỗi updateProfile:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi hệ thống khi lưu" });
    }
};
const getHomeData = async (req, res) => {
    try {
        // 1. Lấy 4 sản phẩm mới nhất (dựa trên ID hoặc ngày tạo)
        const [newProducts] = await db.query(
            'SELECT * FROM products ORDER BY id DESC LIMIT 4'
        );

        // 2. Lấy 4 sản phẩm HOT (Bán chạy nhất - đếm từ bảng order_items)
        const [hotProducts] = await db.query(`
            SELECT p.*, SUM(oi.quantity) as total_sold 
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 4
        `);

        return res.status(200).json({
            errorCode: 0,
            data: {
                newProducts,
                hotProducts
            }
        });
    } catch (error) {
        console.error("Lỗi getHomeData:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi server" });
    }
};
// --- LẤY DANH SÁCH ĐÁNH GIÁ ---
const getProductReviews = async (req, res) => {
    const productId = req.params.id; // Lấy ID sản phẩm từ URL
    try {
        // QUAN TRỌNG: Phải có WHERE product_id = ? để chỉ lấy đánh giá của xe này
        const query = `
            SELECT * FROM reviews 
            WHERE product_id = ? 
            ORDER BY created_at DESC
        `;
        
        const [rows] = await db.execute(query, [productId]);

        return res.status(200).json({
            errorCode: 0,
            data: rows
        });
    } catch (error) {
        console.error("❌ Lỗi getProductReviews:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi server khi lấy đánh giá" });
    }
};

// --- GỬI ĐÁNH GIÁ MỚI ---
const postReview = async (req, res) => {
    const { productId, userId, userName, rating, comment } = req.body;
    
    if (!productId || !userId || !comment) {
        return res.status(400).json({ errorCode: 1, message: "Thiếu thông tin đánh giá" });
    }

    try {
        const query = 'INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)';
        await db.execute(query, [productId, userId, userName, rating, comment]);

        return res.status(200).json({
            errorCode: 0,
            message: "Gửi đánh giá thành công!"
        });
    } catch (error) {
        console.error("❌ Lỗi postReview:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi server khi lưu đánh giá" });
    }

};
// Kiểm tra quyền đánh giá (Sản phẩm phải nằm trong đơn hàng đã giao - 'delivered')
const checkCanReview = async (req, res) => {
    const { productId, userId } = req.query;

    try {
        const query = `
            SELECT o.id 
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
              AND oi.product_id = ? 
              AND (LOWER(o.status) = 'delivered' OR LOWER(o.status) = 'đã giao')
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [userId, productId]);

        if (rows.length > 0) {
            return res.status(200).json({ errorCode: 0, canReview: true });
        } else {
            return res.status(200).json({ 
                errorCode: 0, 
                canReview: false, 
                message: "Bạn cần mua và nhận hàng thành công để để lại đánh giá!" 
            });
        }
    } catch (error) {
        console.error("❌ Lỗi checkCanReview:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi server" });
    }
};

// dịch vụ 
// 1. Lấy thông tin dịch vụ động từ Database
const getServices = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM site_settings");
        
        // Chuyển mảng dữ liệu thành đối tượng key-value để Frontend dễ dùng
        const settings = {};
        rows.forEach(item => {
            settings[item.key_name] = item.value_content;
        });

        return res.status(200).json({
            errorCode: 0,
            data: settings
        });
    } catch (error) {
        console.error("Lỗi getServices:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi server khi lấy thông tin dịch vụ" });
    }
};

// 2. API dành cho Admin cập nhật nội dung (Bảo hành, Bảo trì, Bảo mật)
const updateServiceContent = async (req, res) => {
    const { key_name, value_content } = req.body;

    if (!key_name) {
        return res.status(400).json({ errorCode: 1, message: "Thiếu tên cấu hình cần cập nhật" });
    }

    try {
        const query = `
            INSERT INTO site_settings (key_name, value_content) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE value_content = ?
        `;
        await db.query(query, [key_name, value_content, value_content]);

        return res.status(200).json({
            errorCode: 0,
            message: "Cập nhật nội dung thành công!"
        });
    } catch (error) {
        console.error("Lỗi updateServiceContent:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi hệ thống khi cập nhật" });
    }
};

// 3. Xử lý đăng ký lịch bảo dưỡng
const postBookMaintenance = async (req, res) => {
    const { user_id, full_name, phone, service_type, appointment_date, note } = req.body;

    if (!full_name || !phone || !appointment_date) {
        return res.status(400).json({ errorCode: 1, message: "Vui lòng nhập đủ Tên, SĐT và Ngày hẹn!" });
    }

    try {
        // LƯU VÀO BẢNG maintenances MỚI
        const query = `
            INSERT INTO maintenances (user_id, full_name, phone, service_type, appointment_date, note, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'new')
        `;
        
        await db.query(query, [user_id || null, full_name, phone, service_type, appointment_date, note || '']);

        return res.status(200).json({
            errorCode: 0,
            message: "Đăng ký lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất."
        });
    } catch (error) {
        console.error("Lỗi postBookMaintenance:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi server khi lưu lịch hẹn" });
    }
};
const deleteServiceContent = async (req, res) => {
    const { key } = req.params;
    try {
        await db.query("DELETE FROM site_settings WHERE key_name = ?", [key]);
        return res.status(200).json({ errorCode: 0, message: "Đã xóa cấu hình thành công!" });
    } catch (error) {
        return res.status(500).json({ errorCode: 1, message: "Lỗi khi xóa" });
    }
};
const getMaintenanceRequests = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM maintenances ORDER BY created_at DESC");
        return res.status(200).json({ errorCode: 0, data: rows });
    } catch (error) {
        return res.status(500).json({ errorCode: 1, message: "Lỗi lấy danh sách" });
    }
};
// Cập nhật trạng thái xử lý lịch hẹn bảo dưỡng
const updateMaintenanceStatus = async (req, res) => {
    const { id, status } = req.body;
    try {
        const [result] = await db.query("UPDATE maintenances SET status = ? WHERE id = ?", [status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ errorCode: 1, message: "Không tìm thấy lịch hẹn" });
        
        return res.status(200).json({ errorCode: 0, message: "Cập nhật thành công!" });
    } catch (error) {
        return res.status(500).json({ errorCode: 1, message: "Lỗi cập nhật" });
    }
};
// Lấy danh sách lịch hẹn bảo trì của một khách hàng cụ thể (theo Email)
const getMyAppointments = async (req, res) => {
    const { email } = req.params; // Lưu ý: Nếu bạn dùng user_id thì đổi thành const { id } = req.params;

    try {
        // TRUY VẤN THEO user_id (Vì trong bảng maintenances lưu user_id)
        // Nếu Frontend gửi email, ta cần tìm user_id từ email trước hoặc sửa API truyền id
        const query = `
            SELECT id, service_type as subject, note as message, status, appointment_date, created_at 
            FROM maintenances 
            WHERE user_id = (SELECT id FROM users WHERE email = ? LIMIT 1)
            ORDER BY created_at DESC
        `;
        
        const [rows] = await db.query(query, [email]);

        return res.status(200).json({
            errorCode: 0,
            data: rows,
            message: "Lấy danh sách thành công"
        });
    } catch (error) {
        console.error("Lỗi getMyAppointments:", error);
        return res.status(500).json({ errorCode: 1, message: "Lỗi hệ thống khi lấy lịch hẹn" });
    }
};
//  GỬI MÃ OTP VÀO EMAIL 
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    // 1. Kiểm tra đầu vào
    if (!email || !otp) {
        return res.status(400).json({ 
            errorCode: 1, 
            message: "Thiếu Email hoặc mã OTP!" 
        });
    }

    try {
        // 2. Tìm User dựa trên Email và mã OTP
        const queryFind = 'SELECT * FROM Users WHERE email = ? AND otp_code = ?';
        const [users] = await db.query(queryFind, [email, otp]);

        if (users.length > 0) {
            const user = users[0];

            // 3. Nếu đúng mã, cập nhật trạng thái tài khoản
            // Cài đặt is_verified = 1 và status = 'active', xóa otp_code cho bảo mật
            const queryUpdate = `
                UPDATE Users 
                SET is_verified = 1, status = 'active', otp_code = NULL 
                WHERE id = ?
            `;
            await db.query(queryUpdate, [user.id]);

            return res.status(200).json({ 
                errorCode: 0, 
                message: "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay." 
            });
        } else {
            // 4. Nếu sai mã hoặc email không tồn tại với mã đó
            return res.status(400).json({ 
                errorCode: 1, 
                message: "Mã OTP không chính xác. Vui lòng kiểm tra lại Email!" 
            });
        }

    } catch (error) {
        console.error("❌ Lỗi verifyOTP:", error);
        return res.status(500).json({ 
            errorCode: 1, 
            message: "Lỗi hệ thống khi xác thực mã OTP" 
        });
    }
};
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [user] = await db.query('SELECT id, name FROM Users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ errorCode: 1, message: "Email này không tồn tại trên hệ thống!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Lưu OTP vào DB để kiểm tra sau này
        await db.query('UPDATE Users SET otp_code = ? WHERE email = ?', [otp, email]);

        const mailOptions = {
            from: '"Tuấn Anh Store 🚲" <email_cua_ban@gmail.com>',
            to: email,
            subject: 'MÃ KHÔI PHỤC MẬT KHẨU',
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Khôi phục mật khẩu</h2>
                    <p>Chào <b>${user[0].name}</b>, bạn đã yêu cầu đặt lại mật khẩu.</p>
                    <p>Mã OTP xác nhận của bạn là:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #ff4757; background: #f4f4f4; padding: 10px; text-align: center;">
                        ${otp}
                    </div>
                    <p>Mã này có hiệu lực trong 5 phút. Nếu không phải bạn, hãy đổi mật khẩu ngay để bảo mật.</p>
                </div>`
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ errorCode: 0, message: "Mã OTP đã được gửi vào Email!" });
    } catch (error) {
        return res.status(500).json({ errorCode: 1, message: "Lỗi server" });
    }
};
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        // Kiểm tra OTP có khớp không
        const [user] = await db.query('SELECT id FROM Users WHERE email = ? AND otp_code = ?', [email, otp]);
        
        if (user.length > 0) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.query('UPDATE Users SET password = ?, otp_code = NULL WHERE email = ?', [hashedPassword, email]);
            return res.status(200).json({ errorCode: 0, message: "Đổi mật khẩu thành công! Hãy đăng nhập lại." });
        } else {
            return res.status(400).json({ errorCode: 1, message: "Mã OTP không chính xác!" });
        }
    } catch (error) {
        return res.status(500).json({ errorCode: 1, message: "Lỗi khi đặt lại mật khẩu" });
    }
};

// --- QUẢN LÝ LIÊN HỆ (CONTACTS) ---
const postContact = async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ errorCode: 1, message: "Điền đủ thông tin!" });
    try {
        await db.query("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)", [name, email, subject, message]);
        res.status(200).json({ errorCode: 0, message: "Gửi thành công!" });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi server" }); }
};

const getAdminContacts = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contacts ORDER BY created_at DESC");
        res.status(200).json({ errorCode: 0, data: rows });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi lấy danh sách" }); }
};

const updateContactStatus = async (req, res) => {
    const { id, status } = req.body;
    try {
        await db.query("UPDATE contacts SET status = ? WHERE id = ?", [status, id]);
        res.status(200).json({ errorCode: 0, message: "Đã cập nhật" });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi cập nhật" }); }
};

const deleteContact = async (req, res) => {
    const { id } = req.body;
    try {
        await db.query("DELETE FROM contacts WHERE id = ?", [id]);
        res.status(200).json({ errorCode: 0, message: "Đã xóa" });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi xóa" }); }
};

const replyContact = async (req, res) => {
    const { id, replyMessage } = req.body;
    try {
        await db.query("UPDATE contacts SET status = 'replied', message = CONCAT(message, '\n\n--- PHẢN HỒI: ', ?) WHERE id = ?", [replyMessage, id]);
        res.status(200).json({ errorCode: 0, message: "Đã gửi phản hồi!" });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi hệ thống" }); }
};

// --- CHAT REAL-TIME ---
const getAdminConversations = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM conversations ORDER BY updated_at DESC");
        res.status(200).json({ errorCode: 0, data: rows });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi server" }); }
};

const getChatHistory = async (req, res) => {
    const email = req.params.email;
    try {
        const [rows] = await db.query(`
            SELECT m.* FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE c.customer_email = ?
            ORDER BY m.created_at ASC
        `, [email]);
        res.status(200).json({ errorCode: 0, data: rows });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi lấy lịch sử chat" }); }
};

const postSendChat = async (req, res) => {
    const { email, message, sender_type } = req.body;
    if (!email || !message) return res.status(400).json({ errorCode: 1, message: "Thiếu thông tin" });
    try {
        let [conversations] = await db.query("SELECT id FROM conversations WHERE customer_email = ?", [email]);
        let conversationId;
        if (conversations.length === 0) {
            const [result] = await db.query("INSERT INTO conversations (customer_email, last_message) VALUES (?, ?)", [email, message]);
            conversationId = result.insertId;
        } else {
            conversationId = conversations[0].id;
            await db.query("UPDATE conversations SET last_message = ?, updated_at = NOW() WHERE id = ?", [message, conversationId]);
        }
        await db.query("INSERT INTO messages (conversation_id, sender_type, message_text) VALUES (?, ?, ?)", [conversationId, sender_type, message]);
        res.status(200).json({ errorCode: 0, message: "Đã lưu tin nhắn" });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi server" }); }
};

const postAdminReplyChat = async (req, res) => {
    const { conversation_id, message } = req.body;
    try {
        await db.query("INSERT INTO messages (conversation_id, sender_type, message_text) VALUES (?, 'admin', ?)", [conversation_id, message]);
        await db.query("UPDATE conversations SET last_message = ?, updated_at = NOW() WHERE id = ?", [message, conversation_id]);
        res.status(200).json({ errorCode: 0, message: "Gửi thành công" });
    } catch (error) { res.status(500).json({ errorCode: 1, message: "Lỗi gửi phản hồi" }); }
};

// --- ĐƠN HÀNG CỦA TÔI ---
const getMyOrdersByEmail = async (req, res) => {
    const email = req.params.email;
    try {
        const query = `
            SELECT o.id, o.total_amount, o.status, o.shipping_address, o.order_date AS created_at,
            GROUP_CONCAT(CONCAT(p.id, ':', p.name) SEPARATOR '|') AS products_info
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE u.email = ?
            GROUP BY o.id
            ORDER BY o.order_date DESC
        `;
        const [rows] = await db.query(query, [email]);
        res.status(200).json({ errorCode: 0, data: rows });
    } catch (error) {
        res.status(500).json({ errorCode: 1, message: "Lỗi truy vấn đơn hàng" });
    }
};

// EXPORT

module.exports = {
    getHomePage, geteditPage, postCreateUser, postUpdateUser, deleteUser, updateUserRole, searchUsers,
    getProductPage, postCreateProduct, getEditProductPage, postUpdateProduct, deleteProduct,
    getBrands, postCreateBrand, postUpdateBrand, deleteBrand, searchBrands,
    getOrders, updateOrderStatus, deleteOrder, postCartCheckout, handlePostCheckout,
    locgin, register, getStatistics,getHomeData,getMyAppointments,
    gethome, getProductStore, getProductDetail, getProductsByBrand, getProductsHome,
    getInventoryReceipts ,postCreateReceipt,getSuppliers,getUserProfile,updateProfile,postReview,getProductReviews,
    checkCanReview,getServices, postBookMaintenance, updateServiceContent,deleteServiceContent,getMaintenanceRequests,updateMaintenanceStatus,
    verifyOTP,forgotPassword,resetPassword , postContact, getAdminContacts, 
    updateContactStatus, deleteContact, replyContact, getAdminConversations, 
    getChatHistory, postSendChat, postAdminReplyChat, getMyOrdersByEmail,
};