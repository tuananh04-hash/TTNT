import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ThankYou = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Lấy thông tin từ URL
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        // Nếu thanh toán thành công (VNPAY trả về success hoặc COD navigate sang success)
        if (status === 'success') {
            localStorage.removeItem('cart'); // Xóa giỏ hàng phòng hờ khách chưa xóa
            window.dispatchEvent(new Event('storage')); // Cập nhật Header
            window.dispatchEvent(new Event('orderUpdated')); 
        }
    }, [status]);

    return (
        <div className="container py-5 text-center" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
            <div className="card shadow-lg border-0 p-5 mx-auto" style={{ maxWidth: '600px', borderRadius: '25px' }}>
                
                {/* Kiểm tra: Nếu status là success thì hiện màu xanh, ngược lại hiện màu đỏ */}
                {status === 'success' ? (
                    <>
                        <div className="mb-4" style={{ fontSize: '80px' }}>✅</div>
                        <h2 className="fw-bold text-success mb-3">ĐẶT HÀNG THÀNH CÔNG!</h2>
                        <p className="text-muted fs-5 mb-4">
                            Cảm ơn bạn đã tin tưởng cửa hàng. 
                            {orderId && <span> Đơn hàng <strong>#{orderId}</strong> của bạn đang được xử lý.</span>}
                        </p>
                        <p className="small text-secondary mb-4">Chúng tôi sẽ sớm liên hệ với bạn qua số điện thoại để xác nhận đơn hàng.</p>
                        <button className="btn btn-primary btn-lg rounded-pill px-5 shadow" onClick={() => navigate('/shop-home')}>
                            TIẾP TỤC MUA SẮM
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-4" style={{ fontSize: '80px' }}>❌</div>
                        <h2 className="fw-bold text-danger mb-3">GIAO DỊCH CHƯA HOÀN TẤT</h2>
                        <p className="text-muted fs-5 mb-4">Rất tiếc, đã có lỗi xảy ra hoặc bạn đã hủy quy trình thanh toán.</p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/cart')}>
                                QUAY LẠI GIỎ HÀNG
                            </button>
                            <button className="btn btn-danger rounded-pill px-4" onClick={() => navigate('/shop-home')}>
                                VỀ TRANG CHỦ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ThankYou;