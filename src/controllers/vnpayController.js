const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const db = require('../config/db');

// Helper function sắp xếp tham số (Bắt buộc theo quy định VNPAY)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

/**
 * 1. Hàm tạo URL thanh toán
 */
const createPaymentUrl = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    let orderId = req.body.orderId || moment(date).format('DDHHmmss');
    let amount = req.body.amount;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    let finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
    res.status(200).json({ errorCode: 0, paymentUrl: finalUrl });
};

/**
 * 2. Hàm xử lý kết quả trả về từ VNPAY (vnpayReturn)
 */
const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const secretKey = process.env.VNP_HASH_SECRET;
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];

          // ... đoạn xử lý cập nhật DB phía trên giữ nguyên ...

if (responseCode === '00') {
    await db.query("UPDATE orders SET status = 'Đã thanh toán' WHERE id = ?", [orderId]);

    // TRẢ VỀ MỘT TRANG HTML HOÀN CHỈNH
    return res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Đang xử lý thanh toán...</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding-top: 50px; color: #333; }
                .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <div class="loader"></div>
            <h3>Thanh toán thành công!</h3>
            <p>Đang đưa bạn quay lại cửa hàng...</p>

            <script>
                // Sử dụng replace để không lưu lại trang lỗi trong history
                setTimeout(function() {
                    window.location.replace("http://localhost:3000/thank-you?status=success&orderId=${orderId}");
                }, 500);
            </script>
        </body>
        </html>
    `);
}
        } else {
            return res.status(400).send("Dữ liệu không hợp lệ (Checksum failed)");
        }
    } catch (error) {
        console.error("❌ Lỗi vnpayReturn:", error);
        res.status(500).send("Lỗi xử lý thanh toán nội bộ");
    }
};

// Export các hàm để sử dụng ở Router
module.exports = { 
    createPaymentUrl, 
    vnpayReturn 
};