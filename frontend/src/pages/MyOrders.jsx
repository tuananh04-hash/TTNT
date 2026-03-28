import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null); // Lưu đơn hàng đang xem chi tiết
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const email = user.email;

    useEffect(() => {
        if (email) fetchOrders();
    }, [email]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:3030/api/v1/my-orders/${email}`);
            setOrders(res.data.data || []);
        } catch (err) { 
            console.error("Lỗi lấy đơn hàng:", err); 
        }
    };

    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return <span className="badge bg-warning text-dark">⏳ Đang chờ</span>;
            case 'confirmed': return <span className="badge bg-info">✅ Xác nhận</span>;
            case 'shipping': return <span className="badge bg-primary">🚚 Đang giao</span>;
            case 'delivered': return <span className="badge bg-success">🏁 Thành công</span>;
            case 'cancelled': return <span className="badge bg-danger">❌ Đã hủy</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <div className="container py-5 main-content">
            <h2 className="text-gradient-ocean fw-800 mb-5 text-center">LỊCH SỬ MUA HÀNG</h2>
            
            <div className="row g-4">
                {/* CỘT BÊN TRÁI: DANH SÁCH ĐƠN HÀNG */}
                <div className={selectedOrder ? "col-lg-5" : "col-12"}>
                    {orders.length === 0 ? (
                        <div className="text-center py-5 bg-white rounded-4 border">
                            <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} 
                                className={`card mb-3 border-0 shadow-sm rounded-4 cursor-pointer transition-all ${selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => setSelectedOrder(order)}
                                style={{ cursor: 'pointer', borderLeft: selectedOrder?.id === order.id ? '6px solid #0d6efd' : '6px solid #eee' }}
                            >
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between">
                                        <h6 className="fw-bold mb-1">Mã đơn: #{order.id}</h6>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <small className="text-muted d-block mb-2">Ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}</small>
                                    <div className="fw-bold text-danger">
                                        {Number(order.total_amount).toLocaleString()}đ
                                    </div>
                                    <div className="text-end">
                                        <button className="btn btn-outline-primary btn-sm rounded-pill px-3">Chi tiết</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* CỘT BÊN PHẢI: CHI TIẾT ĐƠN HÀNG & NÚT ĐÁNH GIÁ */}
                {selectedOrder && (
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-lg rounded-4 sticky-top" style={{ top: '100px' }}>
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h4 className="fw-bold mb-0">Chi tiết đơn hàng #{selectedOrder.id}</h4>
                                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                            </div>
                            <div className="card-body p-4">
                                <div className="mb-4">
                                    <p className="mb-1"><b>Người nhận:</b> {user.name}</p>
                                    <p className="mb-1"><b>Địa chỉ:</b> {selectedOrder.shipping_address}</p>
                                    <p className="mb-1"><b>Trạng thái:</b> {getStatusBadge(selectedOrder.status)}</p>
                                </div>

                             // Cập nhật phần hiển thị danh sách sản phẩm trong cột chi tiết
<h6 className="fw-bold text-primary mb-3">DANH SÁCH SẢN PHẨM:</h6>
<div className="list-group list-group-flush">
    {selectedOrder.products_info?.split('|').map((item, idx) => {
        // Tách ID và Tên từ chuỗi "id:name"
        const [pId, pName] = item.split(':');
        
        return (
            <div key={idx} className="list-group-item px-0 py-3 border-0 border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <div className="bg-light rounded p-2 me-3">
                        <i className="bi bi-bicycle fs-4 text-primary"></i>
                    </div>
                    <span className="fw-600">{pName}</span>
                </div>
                
                {/* CHỈ CHO PHÉP ĐÁNH GIÁ KHI ĐƠN HÀNG ĐÃ GIAO THÀNH CÔNG */}
                {selectedOrder.status?.toLowerCase() === 'delivered' || selectedOrder.status === 'Đã giao' ? (
                    <button 
                        className="btn btn-warning btn-sm rounded-pill fw-bold shadow-sm"
                        onClick={() => navigate(`/product-detail/${pId}`)}
                    >
                        ⭐ Đánh giá
                    </button>
                ) : (
                    <small className="text-muted small">Chờ nhận hàng để đánh giá</small>
                )}
            </div>
        );
    })}
</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;