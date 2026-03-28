import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const ORDER_STATUS = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-warning text-dark', value: 'pending' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-info text-white', value: 'confirmed' }, // Khớp SQL
    SHIPPING: { label: 'Đang giao hàng', color: 'bg-primary text-white', value: 'shipping' }, // Khớp SQL
    COMPLETED: { label: 'Đã hoàn thành', color: 'bg-success text-white', value: 'completed' }, // Khớp SQL
    CANCELLED: { label: 'Đã hủy', color: 'bg-danger text-white', value: 'cancelled' }
};

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null); // Lưu ID đơn hàng đang cập nhật
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchOrders = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const res = await axios.get(API_ENDPOINTS.ORDERS);
            if (res.data?.errorCode === 0) {
                setOrders(res.data.data || []);
                if (isRefresh) showToast("Dữ liệu đã được làm mới", "success");
            }
        } catch (err) {
            showToast("Lỗi kết nối Server", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const searchStr = searchTerm.toLowerCase().trim();
        return orders.filter(order => 
            order.id?.toString().includes(searchStr) || 
            order.phone_number?.includes(searchStr) ||
            order.shipping_address?.toLowerCase().includes(searchStr) ||
            order.status?.toLowerCase().includes(searchStr)
        );
    }, [searchTerm, orders]);

    const handleChangeStatus = async (id, newStatusValue) => {
    const statusObj = Object.values(ORDER_STATUS).find(s => s.value === newStatusValue);
    
    if (!window.confirm(`Xác nhận đổi đơn #${id} sang "${statusObj.label}"?`)) return;

    setUpdatingId(id);
    try {
        // SỬA: Gửi đúng tên biến 'id' thay vì 'orderId' để khớp Backend
        // Đảm bảo API_ENDPOINTS.UPDATE_ORDER_STATUS trỏ về /admin/update-order-status
        const res = await axios.post(API_ENDPOINTS.UPDATE_ORDER_STATUS, { 
            id: id, 
            status: newStatusValue 
        });

        if (res.data.errorCode === 0) {
            showToast(`Đã cập nhật trạng thái đơn #${id}`, 'success');
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatusValue } : o));
            
            if (newStatusValue === 'delivered' || newStatusValue === 'completed') {
                window.dispatchEvent(new Event('orderUpdated'));
            }
        } else {
            showToast(res.data.message || "Cập nhật thất bại", 'error');
        }
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        showToast("Lỗi hệ thống hoặc sai đường dẫn API (404)", 'error');
    } finally {
        setUpdatingId(null);
    }
};

    const renderStatusBadge = (statusValue) => {
        const val = statusValue?.toLowerCase();
        const status = Object.values(ORDER_STATUS).find(s => s.value === val) || 
                       { label: statusValue, color: 'bg-secondary text-white' };
        
        return (
            <span className={`badge rounded-pill px-3 py-2 shadow-sm ${status.color}`} style={{ fontSize: '0.72rem', minWidth: '100px' }}>
                {status.label}
            </span>
        );
    };

    return (
        <div className="container-fluid py-4 px-lg-4 bg-light min-vh-100">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
                <div className="row align-items-center">
                    <div className="col-md-5">
                        <h4 className="fw-bold m-0 text-dark">
                            <i className="bi bi-cart4 me-2 text-primary"></i> Đơn Hàng Hệ Thống
                        </h4>
                    </div>
                    <div className="col-md-7 mt-3 mt-md-0">
                        <div className="d-flex gap-2 justify-content-md-end">
                            <div className="position-relative flex-grow-1" style={{maxWidth: '400px'}}>
                                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                <input 
                                    type="text" 
                                    className="form-control rounded-pill ps-5 border-0 bg-light shadow-sm" 
                                    placeholder="Mã đơn, SĐT hoặc địa chỉ..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                className={`btn btn-white border rounded-circle shadow-sm bg-white ${loading ? 'spin' : ''}`} 
                                onClick={() => fetchOrders(true)}
                                disabled={loading}
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-uppercase fw-bold text-muted">
                                <th className="ps-4 py-3">Mã Đơn</th>
                                <th>Khách hàng</th>
                                <th>Địa chỉ nhận hàng</th>
                                <th>Thời gian đặt</th>
                                <th className="text-end">Thành tiền</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center pe-4">Cập nhật nhanh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5"><Loading /></td></tr>
                            ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order.id} className="border-bottom-0">
                                    <td className="ps-4 fw-bold text-dark">#ID-{order.id}</td>
                                    <td>
                                        <div className="fw-bold">{order.phone_number || 'N/A'}</div>
                                        <div className="text-muted x-small">User ID: {order.user_id || 'Guest'}</div>
                                    </td>
                                    <td>
                                        <div className="text-truncate small" style={{maxWidth: '180px'}} title={order.shipping_address}>
                                            {order.shipping_address}
                                        </div>
                                    </td>
                                    <td className="small">
                                        {order.order_date ? new Date(order.order_date).toLocaleDateString('vi-VN') : '--/--/----'}
                                    </td>
                                    <td className="fw-bold text-danger text-end">
                                        {Number(order.total_amount || 0).toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="text-center">
                                        {renderStatusBadge(order.status)}
                                    </td>
                                    <td className="pe-4 text-center">
                                        <select 
                                            className="form-select form-select-sm rounded-pill border-0 bg-light mx-auto"
                                            value={order.status?.toLowerCase()}
                                            disabled={updatingId === order.id}
                                            onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                                            style={{ width: '150px', fontSize: '0.85rem' }}
                                        >
                                            {Object.values(ORDER_STATUS).map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">Không tìm thấy dữ liệu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .x-small { font-size: 0.7rem; }
                .table-hover tbody tr:hover { background-color: #fcfdfe !important; transition: 0.3s; }
                .spin i { display: inline-block; animation: rotation 0.8s infinite linear; }
                @keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(359deg); } }
                .form-select:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default OrderManager;