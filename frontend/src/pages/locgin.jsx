import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const Locgin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Gửi request đăng nhập
            const response = await axios.post(API_ENDPOINTS.LOCGIN, formData);

            // Nếu thành công (200 OK)
            if (response.data && response.data.errorCode === 0) {
                const userData = response.data.data;
                setToast({ message: 'Đăng nhập thành công!', type: 'success' });
                
                localStorage.setItem('token', response.data.token || 'fake-token');
                localStorage.setItem('user', JSON.stringify(userData));
                
                setTimeout(() => {
                    if (userData.role === 'Admin') {
                        navigate('/');
                    } else {
                        navigate('/shop-home');
                    }
                }, 1000);
            }
        } catch (error) {
            // Xử lý lỗi từ Backend (401, 404, 500...)
            const responseData = error.response?.data;

            // Trường hợp 1: Tài khoản chưa xác thực (Mã 401 + errorCode 2)
            if (responseData?.errorCode === 2) {
                setToast({ message: 'Tài khoản chưa xác thực! Đang chuyển đến trang xác nhận OTP...', type: 'error' });
                setTimeout(() => navigate('/register'), 2000);
            } 
            // Trường hợp 2: Sai mật khẩu hoặc email (Mã 401 thông thường)
            else if (responseData?.message) {
                setToast({ message: responseData.message, type: 'error' });
            } 
            // Trường hợp 3: Lỗi server không phản hồi
            else {
                setToast({ message: 'Lỗi kết nối máy chủ!', type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <style>{`
                .login-wrapper {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Inter', sans-serif;
                }
                .login-card {
                    background: #ffffff; border-radius: 24px; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: fadeInUp 0.5s ease-out;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .text-gradient-ocean {
                    background: linear-gradient(to right, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;
                }
                .form-control {
                    background: #f1f5f9; border: 2px solid transparent; border-radius: 12px; padding: 12px 16px; transition: 0.3s;
                }
                .form-control:focus {
                    background: white; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); outline: none;
                }
                .btn-login {
                    background: #2563eb; border: none; border-radius: 12px; padding: 14px; font-weight: 700; transition: 0.3s; color: white;
                }
                .btn-login:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4); }
                .forgot-link {
                    font-size: 0.85rem; color: #64748b; font-weight: 600; text-decoration: none; transition: all 0.2s;
                }
                .forgot-link:hover { color: #2563eb; text-decoration: underline !important; }
            `}</style>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="login-card">
                <div className="text-center mb-4">
                    <h2 className="text-gradient-ocean">ĐĂNG NHẬP</h2>
                    <p className="text-muted small">Chào mừng Tuấn Anh quay trở lại!</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="tuananh@example.com"
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label small fw-bold">Mật khẩu</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="••••••••"
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="text-end mb-4">
                        <span 
                            className="forgot-link" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/forgot-password')}
                        >
                            Quên mật khẩu?
                        </span>
                    </div>

                    <button className="btn btn-login w-100 shadow-sm" disabled={isLoading}>
                        {isLoading ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span> ĐANG XỬ LÝ...</>
                        ) : 'BẮT ĐẦU TRUY CẬP'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <span className="small text-muted">Thành viên mới? </span>
                    <button onClick={() => navigate('/register')} className="btn btn-link text-decoration-none p-0 small fw-bold">Đăng ký ngay</button>
                </div>
            </div>
        </div>
    );
};

export default Locgin;