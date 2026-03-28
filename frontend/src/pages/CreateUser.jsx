import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/footer.jsx';
import '../components/heder.jsx';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';
import { validateUser } from '../utils/validation';

const CreateUser = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        city: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateUser(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setToast({ message: 'Vui lòng kiểm tra lại thông tin', type: 'warning' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(API_ENDPOINTS.CREATE_USER, formData);

            if (response.data && response.data.errorCode === 0) {
                setToast({ message: '✨ Thêm thành viên mới thành công!', type: 'success' });
                setTimeout(() => navigate('/'), 1500);
            } else {
                setToast({ message: response.data?.message || 'Lỗi khi thêm', type: 'error' });
            }
        } catch (error) {
            console.error("Lỗi gửi dữ liệu:", error);
            if (error.response?.data?.message) {
                setToast({ message: error.response.data.message, type: 'error' });
            } else {
                setToast({ message: 'Không thể kết nối đến Server!', type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-content">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)}
                />
            )}

            <div className="form-wrapper" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '28px', fontWeight: '700' }}>
                    ✨ Thêm Thành Viên Mới
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-container" style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            id="name" 
                            name="name"
                            placeholder=" " 
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isLoading}
                            style={{ borderColor: errors.name ? '#ef4444' : '' }}
                        />
                        <label htmlFor="name">Họ và tên</label>
                        {errors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>⚠️ {errors.name}</span>}
                    </div>

                    <div className="input-container" style={{ marginBottom: '20px' }}>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            placeholder=" " 
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            style={{ borderColor: errors.email ? '#ef4444' : '' }}
                        />
                        <label htmlFor="email">Địa chỉ Email</label>
                        {errors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>⚠️ {errors.email}</span>}
                    </div>

                    <div className="input-container" style={{ marginBottom: '30px' }}>
                        <input 
                            type="text" 
                            id="city" 
                            name="city"
                            placeholder=" " 
                            value={formData.city}
                            onChange={handleChange}
                            disabled={isLoading}
                            style={{ borderColor: errors.city ? '#ef4444' : '' }}
                        />
                        <label htmlFor="city">Thành phố</label>
                        {errors.city && <span style={{ color: '#ef4444', fontSize: '12px' }}>⚠️ {errors.city}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit" 
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', width: '100%' }}
                    >
                        {isLoading ? '⏳ Đang tải...' : 'Bắt đầu ngay 🚀'}
                    </button>
                    
                    <div className="text-center mt-3">
                        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                            ← Quay lại danh sách
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;