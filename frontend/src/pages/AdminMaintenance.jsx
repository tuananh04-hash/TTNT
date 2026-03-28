import axios from 'axios';
import { useEffect, useState } from 'react';

const AdminMaintenance = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Lấy danh sách lịch hẹn từ Backend
    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Sử dụng API lấy danh sách contacts chuyên biệt cho bảo trì
            const res = await axios.get('http://localhost:3030/api/v1/admin/maintenance-requests');
            if (res.data.errorCode === 0) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch hẹn:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // 2. Cập nhật trạng thái lịch hẹn
    const updateStatus = async (id, newStatus) => {
        try {
            const res = await axios.post('http://localhost:3030/api/v1/admin/update-maintenance-status', {
                id: id,
                status: newStatus
            });
            
            if (res.data.errorCode === 0) {
                alert("✅ Đã cập nhật trạng thái lịch hẹn!");
                fetchRequests(); // Tải lại danh sách sau khi sửa
            }
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi khi cập nhật trạng thái!");
        }
    };

    // Hàm hiển thị Badge trạng thái cho chuyên nghiệp
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'new': return <span className="badge bg-warning text-dark px-3 py-2">Mới gửi</span>;
            case 'confirmed': return <span className="badge bg-primary px-3 py-2">Đã xác nhận</span>;
            case 'done': return <span className="badge bg-success px-3 py-2">Đã hoàn thành</span>;
            case 'cancelled': return <span className="badge bg-danger px-3 py-2">Đã hủy</span>;
            default: return <span className="badge bg-secondary px-3 py-2">{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark mb-0">
                    <i className="bi bi-calendar-check me-2 text-primary"></i>
                    QUẢN LÝ LỊCH HẸN BẢO TRÌ
                </h2>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchRequests}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th className="ps-4">Khách hàng</th>
                                <th>Nội dung yêu cầu</th>
                                <th>Thời gian gửi</th>
                                <th>Trạng thái</th>
                                <th className="text-center">Thao tác xử lý</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="mt-2 text-muted">Đang tải danh sách lịch hẹn...</div>
                                    </td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map((item) => (
                                    <tr key={item.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{item.name}</div>
                                            <div className="small text-muted italic">{item.email}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary mb-1">{item.subject}</div>
                                            <div className="small text-truncate" style={{ maxWidth: '300px' }} title={item.message}>
                                                {item.message}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small fw-bold">
                                                {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="small text-muted">
                                                {new Date(item.created_at).toLocaleTimeString('vi-VN')}
                                            </div>
                                        </td>
                                        <td>
                                            {renderStatusBadge(item.status)}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center">
                                                <select 
                                                    className="form-select form-select-sm w-auto border-primary-subtle shadow-sm"
                                                    onChange={(e) => updateStatus(item.id, e.target.value)}
                                                    value={item.status}
                                                >
                                                    <option value="new">Chờ xử lý (Mới)</option>
                                                    <option value="confirmed">Xác nhận lịch</option>
                                                    <option value="done">Hoàn thành</option>
                                                    <option value="cancelled">Hủy lịch</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                                        Hiện chưa có lịch hẹn bảo trì nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .table thead th { font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px; }
                .italic { font-style: italic; }
                .form-select-sm { font-size: 0.85rem; border-radius: 6px; }
                .badge { font-weight: 500; font-size: 0.75rem; border-radius: 20px; }
            `}</style>
        </div>
    );
};

export default AdminMaintenance;