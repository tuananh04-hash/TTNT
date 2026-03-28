import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState(''); // Lưu mã OTP khách nhập
    const [isVerifying, setIsVerifying] = useState(false); // Chuyển sang màn hình nhập OTP
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        let tempErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

        if (!formData.name.trim()) tempErrors.name = "Tên không được để trống";
        if (!emailRegex.test(formData.email)) tempErrors.email = "Email không hợp lệ";
        if (!passwordRegex.test(formData.password)) tempErrors.password = "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // BƯỚC 1: GỬI THÔNG TIN ĐĂNG KÝ (BACKEND SẼ GỬI MAIL)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post(API_ENDPOINTS.REGISTER, formData);
            if (response.data && response.data.errorCode === 0) {
                setToast({ message: 'Mã OTP đã được gửi vào Email của bạn!', type: 'success' });
                setIsVerifying(true); // Hiện màn hình nhập OTP
            } else {
                setToast({ message: response.data?.message || 'Lỗi đăng ký!', type: 'error' });
            }
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Email đã tồn tại hoặc lỗi Server!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // BƯỚC 2: GỬI MÃ OTP ĐỂ XÁC THỰC
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setToast({ message: 'Vui lòng nhập mã OTP 6 chữ số!', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            // Lưu ý: Tuấn Anh thêm API_ENDPOINTS.VERIFY_OTP vào file config/api.js nhé
            // Nếu chưa có thì dùng tạm: `http://localhost:3030/api/v1/verify-otp`
            const response = await axios.post('http://localhost:3030/api/v1/verify-otp', {
                email: formData.email,
                otp: otp
            });

            if (response.data && response.data.errorCode === 0) {
                setToast({ message: 'Xác thực thành công! Đang chuyển hướng...', type: 'success' });
                setTimeout(() => navigate('/locgin'), 2000);
            } else {
                setToast({ message: response.data?.message || 'Mã OTP không đúng!', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Lỗi xác thực, vui lòng thử lại!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center fade-in-up" style={{ minHeight: '85vh' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="card shadow-lg border-0 p-4 rounded-4" style={{ width: '100%', maxWidth: '420px' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">
                        {isVerifying ? 'Xác Thực OTP' : 'Tạo Tài Khoản'}
                    </h2>
                    <p className="text-muted small">
                        {isVerifying ? `Chúng tôi đã gửi mã đến ${formData.email}` : 'Vui lòng điền đầy đủ thông tin bên dưới'}
                    </p>
                </div>

                {!isVerifying ? (
                    /* --- FORM ĐĂNG KÝ --- */
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">HỌ VÀ TÊN</label>
                            <input type="text" name="name" className={`form-control rounded-3 ${errors.name ? 'is-invalid' : ''}`} value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">EMAIL CỦA BẠN</label>
                            <input type="email" name="email" className={`form-control rounded-3 ${errors.email ? 'is-invalid' : ''}`} value={formData.email} onChange={handleChange} placeholder="example@gmail.com" />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">MẬT KHẨU</label>
                            <input type="password" name="password" className={`form-control rounded-3 ${errors.password ? 'is-invalid' : ''}`} value={formData.password} onChange={handleChange} placeholder="••••••••" />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary w-100 fw-bold py-2 rounded-pill mt-2 shadow-sm" disabled={isLoading}>
                            {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'TIẾP TỤC'}
                        </button>
                    </form>
                ) : (
                    /* --- FORM NHẬP OTP --- */
                    <form onSubmit={handleVerifyOTP}>
                        <div className="mb-4">
                            <label className="form-label fw-bold small d-block text-center">NHẬP MÃ 6 CHỮ SỐ</label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg text-center fw-bold letter-spacing-lg" 
                                maxLength="6"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ fontSize: '2rem', letterSpacing: '8px' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-success w-100 fw-bold py-2 rounded-pill shadow-sm" disabled={isLoading}>
                            {isLoading ? 'ĐANG KIỂM TRA...' : 'XÁC NHẬN KÍCH HOẠT'}
                        </button>
                        <button type="button" className="btn btn-link w-100 mt-2 text-decoration-none small" onClick={() => setIsVerifying(false)}>
                            Quay lại sửa Email
                        </button>
                    </form>
                )}

                {!isVerifying && (
                    <p className="text-center mt-4 mb-0 small">
                        Đã có tài khoản? <Link to="/locgin" className="text-decoration-none fw-bold text-primary">Đăng nhập</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Register;