import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../App.css'; // Import file CSS vừa tạo
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';
import { validateUser } from '../utils/validation';

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userData, setUserData] = useState({ email: '', name: '', city: '', role: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchUserData(); }, [id]);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_ENDPOINTS.USER(id));
            if (res.data && res.data.errorCode === 0) {
                setUserData(res.data.data);
            } else {
                setToast({ message: 'Không tìm thấy người dùng!', type: 'error' });
                setTimeout(() => navigate('/users'), 2000);
            }
        } catch (error) {
            setToast({ message: 'Lỗi kết nối server', type: 'error' });
        } finally { setIsLoading(false); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateUser(userData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        try {
            const res = await axios.post(API_ENDPOINTS.UPDATE_USER, { ...userData, userId: id });
            if (res.data?.errorCode === 0) {
                setToast({ message: '✅ Cập nhật thành công!', type: 'success' });
                setTimeout(() => navigate('/users'), 1000);
            }
        } catch (error) {
            setToast({ message: 'Lỗi khi lưu dữ liệu!', type: 'error' });
        } finally { setIsSaving(false); }
    };

    if (isLoading) return <Loading fullScreen={true} />;

    return (
        <div className="edit-user-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="edit-card animate__animated animate__zoomIn">
                <div className="edit-header">
                    <div className="edit-icon-circle">
                        <i className="bi bi-person-gear"></i>
                    </div>
                    <h3 className="fw-bold text-dark">Chỉnh sửa thành viên</h3>
                    <p className="text-muted small">Cập nhật thông tin chi tiết của người dùng #{id}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="custom-input-group">
                        <label>Họ và tên</label>
                        <input 
                            type="text" name="name" 
                            className={`form-control custom-input ${errors.name ? 'input-error' : ''}`}
                            value={userData.name} onChange={handleChange}
                            placeholder="Nhập tên đầy đủ"
                        />
                        {errors.name && <span className="error-txt"><i className="bi bi-exclamation-circle me-1"></i>{errors.name}</span>}
                    </div>

                    <div className="custom-input-group">
                        <label>Địa chỉ Email</label>
                        <input 
                            type="email" name="email" 
                            className={`form-control custom-input ${errors.email ? 'input-error' : ''}`}
                            value={userData.email} onChange={handleChange}
                            placeholder="name@company.com"
                        />
                        {errors.email && <span className="error-txt"><i className="bi bi-exclamation-circle me-1"></i>{errors.email}</span>}
                    </div>

                    <div className="custom-input-group">
                        <label>Thành phố</label>
                        <input 
                            type="text" name="city" 
                            className={`form-control custom-input ${errors.city ? 'input-error' : ''}`}
                            value={userData.city} onChange={handleChange}
                        />
                    </div>

                    <div className="custom-input-group">
                        <label>Quyền hạn hệ thống</label>
                        <select 
                            name="role" 
                            className="form-select custom-input"
                            value={userData.role} 
                            onChange={handleChange}
                        >
                            <option value="User">User (Khách hàng)</option>
                            <option value="Staff">Staff (Nhân viên)</option>
                            <option value="Admin">Admin (Quản trị viên)</option>
                        </select>
                    </div>

                    <div className="pt-3">
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? (
                                <span><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</span>
                            ) : 'Lưu thay đổi'}
                        </button>
                        
                        <Link to="/users" className="btn btn-link w-100 mt-2 text-decoration-none text-muted small">
                            <i className="bi bi-arrow-left me-1"></i> Hủy và quay lại
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;