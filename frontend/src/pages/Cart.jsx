import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' hoặc 'vnpay'
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user')) || null;
    const BASE_URL = "http://localhost:3030";

    // 1. Xử lý hiển thị ảnh chuẩn từ Database
    const formatImgSrc = (img) => {
        if (!img) return "https://placehold.co/80x80?text=No+Img";
        let cleanImg = img;
        try {
            if (img.startsWith('[')) {
                const parsed = JSON.parse(img);
                cleanImg = Array.isArray(parsed) ? parsed[0] : img;
            }
        } catch (e) { cleanImg = img; }
        return cleanImg.startsWith('data:') ? cleanImg : `${BASE_URL}/images/${cleanImg}`;
    };

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(data);
        if (user) {
            setPhone(user.phone || "");
            setAddress(user.address || "");
        }
    }, []);

    // 2. Hàm cập nhật số lượng (+ / -)
    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                const qty = item.quantity + delta;
                return { ...item, quantity: qty > 0 ? qty : 1 };
            }
            return item;
        });
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // 3. Hàm xóa sản phẩm khỏi giỏ hàng
    const removeItem = (id) => {
        if (window.confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            const newCart = cartItems.filter(item => item.id !== id);
            setCartItems(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
            window.dispatchEvent(new Event('storage')); 
            setToast({ message: "Đã xóa sản phẩm", type: "info" });
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 4. XỬ LÝ ĐẶT HÀNG (HÀM QUAN TRỌNG NHẤT)
    const handleFinalCheckout = async () => {
        if (!user) {
            setToast({ message: "Vui lòng đăng nhập để đặt hàng!", type: "warning" });
            return setTimeout(() => navigate('/locgin'), 1500);
        }
        if (!address || !phone || cartItems.length === 0) {
            return setToast({ message: "Vui lòng nhập đầy đủ thông tin giao hàng!", type: "error" });
        }

        setIsProcessing(true);

        try {
            // Bước 1: Gửi đơn hàng lên server để lưu vào MySQL
            const res = await axios.post(API_ENDPOINTS.POST_CART_CHECKOUT, {
                user_id: user.id,
                total_amount: totalAmount,
                payment_method: paymentMethod,
                shipping_address: address,
                phone_number: phone,
                note: note,
                cart: cartItems
            });

            if (res.data?.errorCode === 0) {
                const newOrderId = res.data.orderId || "DH-" + Date.now();

                // Bước 2: Phân loại theo phương thức thanh toán
                if (paymentMethod === 'vnpay') {
                    // Gọi API lấy link VNPAY
                    const vnpayRes = await axios.post(API_ENDPOINTS.CREATE_PAYMENT_VNPAY, {
                        amount: totalAmount,
                        orderId: newOrderId, // Truyền ID đơn hàng vừa tạo sang VNPAY
                        bankCode: "" 
                    });

                    if (vnpayRes.data?.paymentUrl) {
                        window.location.href = vnpayRes.data.paymentUrl;
                    } else {
                        setToast({ message: "Lỗi khởi tạo cổng VNPAY", type: "error" });
                    }
                } else {
                    // THANH TOÁN COD THÀNH CÔNG
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new Event('orderUpdated'));
                    
                    // CHÚ Ý: Phải truyền status=success để trang ThankYou hiện màu xanh ✅
                    navigate(`/thank-you?status=success&orderId=${newOrderId}`);
                }
            } else {
                setToast({ message: "❌ " + res.data.message, type: "error" });
            }
        } catch (e) {
            console.error(e);
            setToast({ message: "❌ Lỗi kết nối server", type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container py-5">
            {/* Component thông báo nổi */}
            <div className="toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>

            <h3 className="fw-bold mb-5 mt-4 text-uppercase">Giỏ hàng của bạn</h3>
            
            <div className="row g-5">
                {/* DANH SÁCH SẢN PHẨM */}
                <div className="col-lg-8">
                    {cartItems.length > 0 ? cartItems.map((item) => (
                        <div key={item.id} className="row align-items-center mb-4 pb-4 border-bottom shadow-sm p-3 bg-white rounded">
                            <div className="col-2">
                                <img src={formatImgSrc(item.image)} className="w-100 rounded border" alt={item.name} />
                            </div>
                            <div className="col-4">
                                <h6 className="fw-bold mb-1">{item.name}</h6>
                                <div className="text-danger fw-bold">{item.price.toLocaleString()}đ</div>
                            </div>
                            <div className="col-3 text-center">
                                <div className="btn-group border rounded-pill overflow-hidden">
                                    <button className="btn btn-light btn-sm px-3" onClick={() => updateQuantity(item.id, -1)}>−</button>
                                    <span className="btn btn-white btn-sm fw-bold px-3 disabled">{item.quantity}</span>
                                    <button className="btn btn-light btn-sm px-3" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                </div>
                            </div>
                            <div className="col-2 text-end fw-bold text-primary">
                                {(item.price * item.quantity).toLocaleString()}đ
                            </div>
                            <div className="col-1 text-end">
                                <button className="btn btn-outline-danger btn-sm border-0" onClick={() => removeItem(item.id)}>
                                    <i className="bi bi-trash3-fill fs-5"></i>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5 bg-light rounded">
                            <i className="bi bi-cart-x display-1 text-muted"></i>
                            <p className="mt-3 fs-5 text-muted">Giỏ hàng đang trống.</p>
                            <button className="btn btn-dark rounded-pill px-4" onClick={() => navigate('/store')}>MUA SẮM NGAY</button>
                        </div>
                    )}
                </div>

                {/* THÔNG TIN GIAO HÀNG & TỔNG TIỀN */}
                <div className="col-lg-4">
                    <div className="card p-4 shadow-sm border-0" style={{ borderRadius: '20px', backgroundColor: '#f9f9f9' }}>
                        <h5 className="fw-bold mb-4 border-bottom pb-2">CHI TIẾT ĐƠN HÀNG</h5>
                        
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary text-uppercase">Số điện thoại</label>
                            <input type="text" className="form-control mt-1" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập SĐT..." />
                        </div>
                        
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary text-uppercase">Địa chỉ giao hàng</label>
                            <textarea className="form-control mt-1" rows="3" value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ chi tiết..."></textarea>
                        </div>
                        
                        <div className="mb-4">
                            <label className="small fw-bold text-secondary text-uppercase mb-2 d-block">Hình thức thanh toán</label>
                            <div className={`card p-3 mb-2 border-2 ${paymentMethod === 'cod' ? 'border-primary bg-white' : 'border-light'}`} 
                                 style={{cursor: 'pointer', transition: '0.3s'}} onClick={() => setPaymentMethod('cod')}>
                                <div className="form-check m-0 pointer-event">
                                    <input className="form-check-input" type="radio" checked={paymentMethod === 'cod'} readOnly />
                                    <label className="form-check-label fw-bold">Tiền mặt (COD)</label>
                                </div>
                            </div>
                            <div className={`card p-3 border-2 ${paymentMethod === 'vnpay' ? 'border-primary bg-white shadow-sm' : 'border-light'}`} 
                                 style={{cursor: 'pointer', transition: '0.3s'}} onClick={() => setPaymentMethod('vnpay')}>
                                <div className="form-check m-0">
                                    <input className="form-check-input" type="radio" checked={paymentMethod === 'vnpay'} readOnly />
                                    <label className="form-check-label fw-bold text-primary">Cổng VNPAY 💳</label>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between h4 fw-bold mb-4 border-top pt-3 text-danger">
                            <span>TỔNG TIỀN:</span>
                            <span>{totalAmount.toLocaleString()}đ</span>
                        </div>

                        <button className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow" 
                                onClick={handleFinalCheckout} disabled={isProcessing || cartItems.length === 0}>
                            {isProcessing ? <span className="spinner-border spinner-border-sm me-2"></span> : 'XÁC NHẬN ĐẶT HÀNG'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;