import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Pass mới
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // Bước 1: Gửi yêu cầu OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // ĐÃ SỬA: Dùng API_ENDPOINTS.FORGOT_PASSWORD
            const res = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
            if (res.data.errorCode === 0) {
                setToast({ message: "Mã OTP đã gửi thành công!", type: "success" });
                setStep(2);
            }
        } catch (err) {
            setToast({ message: err.response?.data?.message || "Email không tồn tại!", type: "error" });
        } finally { setIsLoading(false); }
    };

    // Bước 2: Đặt lại mật khẩu
    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setToast({ message: "Mật khẩu mới phải từ 6 ký tự!", type: "error" });
            return;
        }
        setIsLoading(true);
        try {
            // ĐÃ SỬA: Dùng API_ENDPOINTS.RESET_PASSWORD
            const res = await axios.post(API_ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword });
            if (res.data.errorCode === 0) {
                setToast({ message: "Đổi mật khẩu thành công! Đang chuyển hướng...", type: "success" });
                setTimeout(() => navigate('/locgin'), 2000);
            }
        } catch (err) {
            setToast({ message: err.response?.data?.message || "Mã OTP không đúng!", type: "error" });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="forgot-wrapper">
            <style>{`
                .forgot-wrapper {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Inter', sans-serif;
                }
                .forgot-card {
                    background: #fff; border-radius: 24px; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .btn-ocean {
                    background: linear-gradient(to right, #2563eb, #7c3aed); color: white; border: none; border-radius: 12px; padding: 12px; font-weight: 700; transition: 0.3s;
                }
                .btn-ocean:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3); }
                .otp-input {
                    letter-spacing: 10px; font-size: 1.5rem !important; text-align: center; font-weight: 800; border: 2px solid #e2e8f0; border-radius: 12px;
                }
                .otp-input:focus { border-color: #7c3aed; outline: none; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
            `}</style>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="forgot-card fade-in-up">
                <div className="text-center mb-4">
                    <div className="mb-3">
                        <i className={`bi ${step === 1 ? 'bi-envelope-at-fill' : 'bi-shield-lock-fill'} fs-1 text-primary`}></i>
                    </div>
                    <h3 className="fw-bold text-dark">
                        {step === 1 ? "Quên mật khẩu?" : "Mật khẩu mới"}
                    </h3>
                    <p className="text-muted small">
                        {step === 1 ? "Nhập email để nhận mã xác thực khôi phục" : `Mã đã được gửi đến ${email}`}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="mb-3">
                            <label className="small fw-bold mb-1">EMAIL ĐĂNG KÝ</label>
                            <input type="email" className="form-control rounded-3 py-2" placeholder="tuananh@example.com" required onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <button className="btn btn-ocean w-100 mt-2" disabled={isLoading}>
                            {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : "GỬI MÃ OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset}>
                        <div className="mb-3">
                            <label className="small fw-bold mb-1 d-block text-center">NHẬP MÃ OTP 6 SỐ</label>
                            <input type="text" className="form-control otp-input" placeholder="000000" maxLength="6" required onChange={(e) => setOtp(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="small fw-bold mb-1">MẬT KHẨU MỚI</label>
                            <input type="password" name="password" className="form-control rounded-3 py-2" placeholder="Nhập ít nhất 6 ký tự" required onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <button className="btn btn-ocean w-100" disabled={isLoading}>
                            {isLoading ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN ĐỔI MẬT KHẨU"}
                        </button>
                    </form>
                )}
                
                <div className="mt-4 text-center">
                    <button className="btn btn-link text-decoration-none small fw-bold" onClick={() => navigate('/locgin')}>
                        <i className="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;