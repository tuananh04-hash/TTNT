import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/footer.jsx';
import '../components/heder.jsx';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const CreateProduct = () => {
    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        image: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
        
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Hàm validate thủ công (phòng trường hợp file validation.js của bạn bị lỗi)
    const validate = () => {
        let tempErrors = {};
        if (!product.name.trim()) tempErrors.name = "Tên sản phẩm không được để trống";
        if (!product.category.trim()) tempErrors.category = "Loại xe không được để trống";
        if (!product.price || product.price <= 0) tempErrors.price = "Giá phải lớn hơn 0";
        if (!product.stock || product.stock < 0) tempErrors.stock = "Số lượng không hợp lệ";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            setToast({ message: 'Vui lòng điền đầy đủ thông tin!', type: 'warning' });
            return;
        }

        setIsLoading(true);

        // QUAN TRỌNG: Ép kiểu dữ liệu về Number trước khi gửi lên API
        const dataToSend = {
            ...product,
            price: Number(product.price),
            stock: Number(product.stock)
        };

        try {
            const res = await axios.post(API_ENDPOINTS.CREATE_PRODUCT, dataToSend);
            
            if (res.data && res.data.errorCode === 0) {
                setToast({ message: '🚀 Thêm sản phẩm thành công!', type: 'success' });
                // Đợi 1.5s để hiện Toast rồi mới chuyển trang
                setTimeout(() => navigate('/products'), 1500);
            } else {
                setToast({ message: res.data?.message || 'Lỗi từ Server', type: 'error' });
            }
        } catch (error) {
            console.error("Lỗi API:", error.response?.data || error.message);
            setToast({ 
                message: error.response?.data?.message || 'Không thể kết nối Server!', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-content container py-5 animate__animated animate__fadeIn">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)}
                />
            )}

            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="form-wrapper shadow-lg p-4" style={{ borderRadius: '25px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
                        <h2 className="mb-4 text-center fw-bold" style={{ color: '#0077b6' }}>✨ THÊM XE ĐẠP MỚI</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold text-muted">Tên xe *</label>
                                    <input 
                                        type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                                        name="name" placeholder="Giant ATX 810..."
                                        value={product.name} onChange={handleChange} disabled={isLoading}
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold text-muted">Phân loại *</label>
                                    <input 
                                        type="text" className={`form-control ${errors.category ? 'is-invalid' : ''}`} 
                                        name="category" placeholder="MTB, Road, City..."
                                        value={product.category} onChange={handleChange} disabled={isLoading}
                                    />
                                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold text-muted">Giá bán (VNĐ) *</label>
                                    <input 
                                        type="number" className={`form-control ${errors.price ? 'is-invalid' : ''}`} 
                                        name="price" value={product.price} onChange={handleChange} disabled={isLoading}
                                    />
                                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold text-muted">Số lượng kho *</label>
                                    <input 
                                        type="number" className={`form-control ${errors.stock ? 'is-invalid' : ''}`} 
                                        name="stock" value={product.stock} onChange={handleChange} disabled={isLoading}
                                    />
                                    {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted">Link ảnh sản phẩm</label>
                                <input 
                                    type="text" className="form-control" name="image" 
                                    placeholder="https://..." value={product.image} onChange={handleChange}
                                />
                                {product.image && (
                                    <div className="mt-3 text-center">
                                        <img src={product.image} alt="preview" style={{ maxHeight: '150px', borderRadius: '15px', border: '2px solid #00b4d8' }} 
                                             onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Loi+Anh'} />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted">Mô tả chi tiết</label>
                                <textarea 
                                    className="form-control" name="description" rows="3" 
                                    value={product.description} onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="d-flex gap-3">
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isLoading} style={{ borderRadius: '15px' }}>
                                    {isLoading ? '⏳ Đang xử lý...' : 'XÁC NHẬN LƯU 🚀'}
                                </button>
                                <Link to="/products" className="btn btn-outline-secondary py-2 px-4" style={{ borderRadius: '15px' }}>
                                    Hủy
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;