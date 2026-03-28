import axios from 'axios';
import { useState } from 'react';
// Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn
import { API_ENDPOINTS } from '../config/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Kiểm tra xem API_ENDPOINTS có tồn tại không, nếu không dùng link cứng để test
            const apiUrl = API_ENDPOINTS?.CONTACT || 'http://localhost:3030/api/v1/contact';
            
            const response = await axios.post(apiUrl, formData);
            
            if (response.data.errorCode === 0) {
                alert("✅ " + response.data.message);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                alert("❌ Lỗi: " + response.data.message);
            }
        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            alert("❌ Không thể kết nối đến máy chủ. Hãy chắc chắn Backend đang chạy!");
        }
    };

    return (
        <div className="container py-5">
            <div className="row g-4">
                {/* Thông tin liên hệ */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4 h-100">
                        <h3 className="fw-bold mb-4">Thông Tin Liên Hệ</h3>
                        <p className="mb-4 text-white-50">Đừng ngần ngại liên hệ với chúng tôi. Chúng tôi hỗ trợ bạn 24/7.</p>
                        
                        <div className="d-flex mb-3">
                            <i className="bi bi-geo-alt-fill fs-4 me-3"></i>
                            <div>
                                <h6 className="mb-0 fw-bold">Địa chỉ:</h6>
                                <p className="small mb-0">123 Đường ABC, Quận ABC, TP. Hà Nội</p>
                            </div>
                        </div>

                        <div className="d-flex mb-3">
                            <i className="bi bi-telephone-fill fs-4 me-3"></i>
                            <div>
                                <h6 className="mb-0 fw-bold">Điện thoại:</h6>
                                <p className="small mb-0">0387 301 909</p>
                            </div>
                        </div>

                        <div className="d-flex mb-3">
                            <i className="bi bi-envelope-at-fill fs-4 me-3"></i>
                            <div>
                                <h6 className="mb-0 fw-bold">Email:</h6>
                                <p className="small mb-0">support@banxe.com</p>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <h6 className="mb-3 fw-bold">Theo dõi chúng tôi:</h6>
                            <div className="d-flex gap-3">
                                <a href="#" className="text-white fs-4"><i className="bi bi-facebook"></i></a>
                                <a href="#" className="text-white fs-4"><i className="bi bi-youtube"></i></a>
                                <a href="#" className="text-white fs-4"><i className="bi bi-tiktok"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form gửi tin nhắn */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h3 className="fw-bold text-dark mb-4">Gửi Tin Nhắn</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Họ và tên</label>
                                    <input type="text" name="name" className="form-control bg-light border-0 py-2" 
                                           value={formData.name} onChange={handleChange} required placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Email</label>
                                    <input type="email" name="email" className="form-control bg-light border-0 py-2" 
                                           value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Chủ đề</label>
                                    <input type="text" name="subject" className="form-control bg-light border-0 py-2" 
                                           value={formData.subject} onChange={handleChange} required placeholder="Cần tư vấn mua xe..." />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Nội dung</label>
                                    <textarea name="message" className="form-control bg-light border-0 py-2" rows="5" 
                                              value={formData.message} onChange={handleChange} required placeholder="Nhập tin nhắn..."></textarea>
                                </div>
                                <div className="col-12 text-end">
                                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold shadow-sm rounded-pill">
                                        <i className="bi bi-send-fill me-2"></i> Gửi Ngay
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bản đồ đơn giản - Dùng Iframe để tránh lỗi Console */}
            <div className="mt-5">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{height: '400px'}}>
                    <iframe 
                        title="map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.097014165511!2d105.7797143153321!3d21.028779693153526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b329f68977%3A0x31ad87589d39691d!2zS2h1IMSRw7QgdGjhu4sgTeG7uSDEkMOsbmggMiwgTmFtIFThu6sgTGnDqm0sIEjDoCBO4buZaSwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1615965412345" 
                        width="100%" height="100%" style={{border: 0}} allowFullScreen="" loading="lazy">
                    </iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;