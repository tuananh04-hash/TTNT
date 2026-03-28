import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AdminServices = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho Form thêm/sửa
    const [currentEdit, setCurrentEdit] = useState({ key_name: '', value_content: '' });
    const [isEditing, setIsEditing] = useState(false);

    // 1. Tải danh sách cấu hình từ Database
    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Sử dụng endpoint đã khai báo trong api.js
            const res = await axios.get(API_ENDPOINTS.GET_SERVICES_INFO);
            if (res.data.errorCode === 0) {
                // Chuyển object {key: value} từ Backend thành mảng [{key_name, value_content}]
                const dataArray = Object.keys(res.data.data).map(key => ({
                    key_name: key,
                    value_content: res.data.data[key]
                }));
                setSettings(dataArray);
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // 2. Xử lý Thêm hoặc Cập nhật
    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentEdit.key_name || !currentEdit.value_content) {
            alert("Vui lòng nhập đầy đủ tên khóa và nội dung!");
            return;
        }

        try {
            // Gọi API cập nhật (hàm updateServiceContent ở backend xử lý cả thêm và sửa)
            const res = await axios.post(API_ENDPOINTS.ADMIN_UPDATE_SERVICE_CONTENT, currentEdit);
            
            if (res.data.errorCode === 0) {
                alert(isEditing ? "✅ Cập nhật thành công!" : "✅ Thêm mới thành công!");
                setCurrentEdit({ key_name: '', value_content: '' });
                setIsEditing(false);
                fetchSettings(); // Tải lại bảng dữ liệu
            } else {
                alert("❌ Lỗi: " + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi hệ thống khi lưu dữ liệu!");
        }
    };

    // 3. Xử lý Xóa cấu hình
    const handleDelete = async (key) => {
        if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn cấu hình "${key}"?`)) {
            try {
                // Gọi API xóa chúng ta vừa viết ở backend
                const res = await axios.post(API_ENDPOINTS.ADMIN_DELETE_SERVICE_CONTENT, {
                    key_name: key
                });

                if (res.data.errorCode === 0) {
                    alert("🗑️ Đã xóa thành công!");
                    fetchSettings(); // Tải lại bảng
                } else {
                    alert("❌ Lỗi xóa: " + res.data.message);
                }
            } catch (err) {
                console.error(err);
                alert("❌ Lỗi hệ thống khi xóa!");
            }
        }
    };

    // Bắt đầu sửa một mục
    const startEdit = (item) => {
        setCurrentEdit(item);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang mượt mà
    };

    // Hủy bỏ trạng thái sửa
    const cancelEdit = () => {
        setIsEditing(false);
        setCurrentEdit({ key_name: '', value_content: '' });
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary mb-0">
                    <i className="bi bi-gear-wide-connected me-2"></i>
                    QUẢN LÝ NỘI DUNG DỊCH VỤ
                </h2>
                <span className="badge bg-info text-dark">Dữ liệu động</span>
            </div>

            <div className="row">
                {/* CỘT TRÁI: FORM NHẬP LIỆU */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 p-4 mb-4 sticky-top" style={{ top: '20px' }}>
                        <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">
                            {isEditing ? "📝 Chỉnh sửa nội dung" : "➕ Thêm chính sách mới"}
                        </h5>
                        <form onSubmit={handleSave}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Mã nhận diện (Key Name)</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light" 
                                    placeholder="ví dụ: warranty_policy"
                                    value={currentEdit.key_name}
                                    onChange={(e) => setCurrentEdit({...currentEdit, key_name: e.target.value})}
                                    disabled={isEditing} // Khóa mã này khi đang sửa để tránh sai lệch DB
                                    required
                                />
                                <small className="text-muted italic small">* Viết liền, không dấu (ví dụ: maintenance_info)</small>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Nội dung chi tiết (Value)</label>
                                <textarea 
                                    className="form-control" 
                                    rows="10" 
                                    placeholder="Nhập nội dung hiển thị cho khách hàng..."
                                    value={currentEdit.value_content}
                                    onChange={(e) => setCurrentEdit({...currentEdit, value_content: e.target.value})}
                                    required
                                />
                                <small className="text-muted small">* Bạn có thể xuống dòng thoải mái.</small>
                            </div>
                            <div className="d-grid gap-2 d-md-flex">
                                <button type="submit" className="btn btn-primary flex-grow-1 fw-bold">
                                    {isEditing ? "LƯU THAY ĐỔI" : "TẠO MỚI"}
                                </button>
                                {isEditing && (
                                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                                        HỦY
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI: BẢNG DANH SÁCH DỮ LIỆU */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="ps-4" style={{ width: '30%' }}>Mã cấu hình</th>
                                            <th>Nội dung hiện tại</th>
                                            <th className="text-center" style={{ width: '180px' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="3" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                                        ) : settings.length > 0 ? (
                                            settings.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="ps-4">
                                                        <code className="text-danger fw-bold">{item.key_name}</code>
                                                    </td>
                                                    <td>
                                                        <div className="text-muted small text-truncate" style={{ maxWidth: '350px' }}>
                                                            {item.value_content}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary me-2" 
                                                            onClick={() => startEdit(item)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger" 
                                                            onClick={() => handleDelete(item.key_name)}
                                                            title="Xóa bỏ"
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="3" className="text-center py-5">Chưa có dữ liệu nào được tạo.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .form-control:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.2rem rgba(13,110,253,.15); }
                .table-hover tbody tr:hover { background-color: rgba(13,110,253,.02); }
                .italic { font-style: italic; }
            `}</style>
        </div>
    );
};

export default AdminServices;