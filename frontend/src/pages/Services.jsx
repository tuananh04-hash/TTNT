import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const Services = () => {
    const user = JSON.parse(localStorage.getItem('user')) || null;

    const [activeTab, setActiveTab] = useState('none'); 
    const [myAppointments, setMyAppointments] = useState([]);
    const [content, setContent] = useState({
        maintenance_content: 'Đang tải...',
        warranty_content: 'Đang tải...',
        privacy_content: 'Đang tải...'
    });

    const [formData, setFormData] = useState({
        service_type: 'Bảo dưỡng định kỳ',
        appointment_date: '',
        note: ''
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // --- HÀM LẤY LỊCH HẸN (Đã khớp với bảng maintenances) ---
    const fetchMyAppointments = async () => {
        // QUAN TRỌNG: Backend mới lọc theo Email hoặc ID, ở đây ta dùng Email cho đồng bộ
        if (!user || !user.email) return;
        try {
            const res = await axios.get(API_ENDPOINTS.GET_MY_MAINTENANCE(user.email)); 
            
            if (res.data.errorCode === 0) {
                // Backend đã dùng AS subject, AS message nên ở đây không cần đổi tên biến
                setMyAppointments(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải lịch hẹn:", err);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Lấy nội dung trang tĩnh (Bảo hành, Bảo mật...)
                const resContent = await axios.get(API_ENDPOINTS.GET_SERVICES_INFO);
                if (resContent.data.errorCode === 0) {
                    setContent(resContent.data.data);
                }
                
                // 2. Tải lịch hẹn nếu đã login
                if (user && user.email) {
                    await fetchMyAppointments();
                }
            } catch (err) {
                console.error("Lỗi tải trang:", err);
            } finally {
                setPageLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleToggleHistory = () => {
        if (!user) {
            alert("Vui lòng đăng nhập để theo dõi lịch hẹn!");
            return;
        }
        if (activeTab === 'history') {
            setActiveTab('none');
        } else {
            setActiveTab('history');
            fetchMyAppointments();
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Vui lòng đăng nhập!");
            return;
        }
        setLoading(true);
        try {
            // KHỚP VỚI BẢNG maintenances: user_id, full_name, phone, service_type, appointment_date, note
            const res = await axios.post(API_ENDPOINTS.BOOK_MAINTENANCE, {
                user_id: user.id,
                full_name: user.name,
                phone: user.phone || '0000000000', // Đảm bảo không trống SĐT
                service_type: formData.service_type,
                appointment_date: formData.appointment_date,
                note: formData.note
            });

            if (res.data.errorCode === 0) {
                alert("✅ Đã gửi yêu cầu đặt lịch bảo dưỡng thành công!");
                setFormData({ service_type: 'Bảo dưỡng định kỳ', appointment_date: '', note: '' });
                setActiveTab('history');
                fetchMyAppointments(); // Load lại danh sách ngay lập tức
            }
        } catch (err) {
            alert("❌ Gửi yêu cầu thất bại. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm render badge trạng thái
    const renderStatus = (status) => {
        switch (status) {
            case 'new': return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">Chờ duyệt</span>;
            case 'confirmed': return <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm">Đã xác nhận</span>;
            case 'done': return <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">Hoàn thành</span>;
            case 'cancelled': return <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm">Đã hủy</span>;
            default: return <span className="badge bg-secondary px-3 py-2 rounded-pill shadow-sm">{status}</span>;
        }
    };

    if (pageLoading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;

    return (
        <div className="services-page py-5" style={{ background: '#f8f9fa' }}>
            <div className="container">
                <h2 className="text-center fw-bold mb-5 text-uppercase text-primary">Dịch vụ & Bảo trì</h2>

                <div className="row g-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4 border-top border-primary border-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                                <div className="d-flex align-items-center mb-3 mb-md-0">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="bi bi-tools fs-3 text-primary"></i>
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark">Lịch hẹn của tôi</h3>
                                        <p className="text-muted mb-0 small">Xem và đăng ký lịch bảo dưỡng xe đạp</p>
                                    </div>
                                </div>
                                
                                <div className="d-flex gap-2">
                                    <button 
                                        className={`btn ${activeTab === 'history' ? 'btn-info text-white' : 'btn-outline-info'} fw-bold px-4 rounded-pill`}
                                        onClick={handleToggleHistory}
                                    >
                                        <i className="bi bi-clock-history me-2"></i>Lịch sử hẹn
                                    </button>
                                    <button 
                                        className={`btn ${activeTab === 'form' ? 'btn-secondary' : 'btn-primary'} fw-bold px-4 rounded-pill shadow-sm`}
                                        onClick={() => setActiveTab(activeTab === 'form' ? 'none' : 'form')}
                                    >
                                        {activeTab === 'form' ? 'Hủy bỏ' : 'Đặt lịch mới'}
                                    </button>
                                </div>
                            </div>

                            {/* --- TAB ĐẶT LỊCH --- */}
                            {activeTab === 'form' && (
                                <div className="mt-2 p-4 bg-light rounded-4 border animate__animated animate__fadeIn">
                                    <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-calendar-plus me-2"></i>Đăng ký lịch bảo dưỡng</h5>
                                    <form onSubmit={handleBooking} className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Dịch vụ</label>
                                            <select className="form-select" value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})}>
                                                <option>Bảo dưỡng định kỳ</option>
                                                <option>Sửa chữa hư hỏng</option>
                                                <option>Thay thế linh kiện</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Ngày hẹn</label>
                                            <input type="date" className="form-control" required value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Ghi chú tình trạng xe</label>
                                            <input type="text" className="form-control" placeholder="Ví dụ: Phanh bị rít..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
                                        </div>
                                        <div className="col-12 text-center mt-4">
                                            <button type="submit" className="btn btn-primary px-5 fw-bold rounded-pill py-2 shadow" disabled={loading}>
                                                {loading ? 'Đang xử lý...' : 'GỬI YÊU CẦU NGAY'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* --- TAB LỊCH SỬ (Khớp bảng maintenances) --- */}
                            {activeTab === 'history' && (
                                <div className="mt-2 p-4 bg-white rounded-4 border animate__animated animate__fadeIn">
                                    <h5 className="fw-bold mb-4 text-info"><i className="bi bi-activity me-2"></i>Trạng thái yêu cầu</h5>
                                    {myAppointments.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr className="small text-muted">
                                                        <th>Dịch vụ & Ghi chú</th>
                                                        <th>Ngày hẹn</th>
                                                        <th className="text-center">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myAppointments.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                {/* subject và message đã được Alias từ service_type và note trong SQL */}
                                                                <div className="fw-bold text-dark">{item.subject}</div>
                                                                <div className="text-muted small italic">{item.message || 'Không có ghi chú'}</div>
                                                            </td>
                                                            <td>
                                                                <div className="small fw-bold">
                                                                    {new Date(item.appointment_date).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                {renderStatus(item.status)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                                            <p className="text-muted">Bạn chưa có lịch bảo dưỡng nào.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 border-start border-success border-4">
                            <h5 className="fw-bold text-success mb-3"><i className="bi bi-shield-check me-2"></i>Chính sách bảo hành</h5>
                            <p className="small text-muted" style={{ whiteSpace: 'pre-line' }}>{content.warranty_content}</p>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 border-start border-dark border-4">
                            <h5 className="fw-bold mb-3"><i className="bi bi-lock me-2"></i>Chính sách bảo mật</h5>
                            <p className="small text-muted" style={{ whiteSpace: 'pre-line' }}>{content.privacy_content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;