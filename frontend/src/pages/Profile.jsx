import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const Profile = () => {
    const [user, setUser] = useState({
        name: '', email: '', phone: '', city: '', address: ''
    });
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // Lấy thông tin user từ localStorage khi load trang
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (currentUser && currentUser.id) {
            fetchUserProfile(currentUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (id) => {
        try {
            const res = await axios.get(API_ENDPOINTS.USER_PROFILE(id));
            if (res.data && res.data.errorCode === 0) {
                const data = res.data.data;
                setUser({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    city: data.city || '',
                    address: data.address || ''
                });
            }
        } catch (error) {
            console.error("❌ Lỗi tải profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        
        console.log(">>> [1] Dữ liệu gửi đi:", { id: currentUser.id, ...user });

        try {
            const res = await axios.post(API_ENDPOINTS.UPDATE_PROFILE, {
                id: currentUser.id, 
                ...user
            });

            console.log(">>> [2] Phản hồi từ Server:");
            console.table(res.data); // Hiện bảng dữ liệu trong console cực đẹp

            if (res.data && res.data.errorCode === 0) {
                // 1. Hiện thông báo thành công
                setToast({ message: "✅ Cập nhật thông tin thành công!", type: "success" });

                // 2. Cập nhật localStorage để Header đổi tên theo
                const updatedUser = { ...currentUser, ...user };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // 3. Tự ẩn thông báo sau 3 giây
                setTimeout(() => setToast(null), 3000);

            } else {
                setToast({ message: "❌ " + (res.data.message || "Lỗi cập nhật"), type: "error" });
            }
        } catch (error) {
            console.error("❌ Lỗi handleUpdate:", error);
            const msg = error.response?.status === 404 
                ? "Lỗi 404: Link API không tồn tại!" 
                : "Lỗi kết nối server!";
            setToast({ message: "❌ " + msg, type: "error" });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-5">
            {/* LƯU Ý: Phải có div toast-container bọc ngoài component Toast */}
            <div className="toast-container">
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </div>
            
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow border-0" style={{ borderRadius: '20px' }}>
                        <div className="card-header bg-primary text-white py-3 text-center" style={{ borderRadius: '20px 20px 0 0' }}>
                            <h4 className="mb-0 fw-bold">CHỈNH SỬA HỒ SƠ</h4>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleUpdate}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold text-secondary">Họ và tên</label>
                                        <input type="text" className="form-control" name="name" value={user.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold text-secondary">Email (Không thể sửa)</label>
                                        <input type="email" className="form-control bg-light text-muted" name="email" value={user.email} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold text-secondary">Số điện thoại</label>
                                        <input type="text" className="form-control" name="phone" value={user.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại..." />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold text-secondary">Thành phố</label>
                                        <input type="text" className="form-control" name="city" value={user.city} onChange={handleInputChange} placeholder="Ví dụ: Hà Nội..." />
                                    </div>
                                    <div className="col-12 mb-4">
                                        <label className="form-label fw-bold text-secondary">Địa chỉ chi tiết</label>
                                        <textarea className="form-control" name="address" rows="3" value={user.address} onChange={handleInputChange} placeholder="Số nhà, tên đường..."></textarea>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill shadow fw-bold" disabled={isUpdating}>
                                        {isUpdating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                ĐANG LƯU...
                                            </>
                                        ) : 'LƯU THAY ĐỔI'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;