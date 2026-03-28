import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const EditProduct = () => {
    const { id } = useParams(); // Lấy ID xe từ URL
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Khởi tạo state với các giá trị mặc định
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        images: [], // Lưu dữ liệu ảnh (có thể là tên file cũ hoặc base64 mới)
        imagePreviews: [] // Chỉ dùng để hiển thị lên màn hình
    });

    const BASE_URL = "http://localhost:3030";

    // --- BƯỚC 1: TỰ ĐỘNG LẤY THÔNG TIN CŨ KHI MỞ TRANG ---
    const fetchProductData = useCallback(async () => {
        try {
            // Gọi API lấy chi tiết xe theo ID
            const res = await axios.get(`${API_ENDPOINTS.PRODUCT}/${id}`);
            
            if (res.data.errorCode === 0) {
                const p = res.data.data;
                let existingImages = [];
                
                // Giải mã dữ liệu ảnh từ CSDL (vì bạn đang lưu dạng JSON mảng nhiều ảnh)
                try {
                    if (p.image && p.image.startsWith('[')) {
                        existingImages = JSON.parse(p.image);
                    } else if (p.image) {
                        existingImages = [p.image];
                    }
                } catch (e) {
                    existingImages = p.image ? [p.image] : [];
                }

                // Chuyển đổi tên file thành đường dẫn URL để hiển thị preview
                const previews = existingImages.map(img => 
                    img.startsWith('data:') ? img : `${BASE_URL}/images/${img}`
                );

                // "COM VỚT" (Convert) dữ liệu từ DB vào các ô Input của Form
                setFormData({
                    name: p.name || '',
                    price: p.price || '',
                    description: p.description || '',
                    images: existingImages, // Giữ lại danh sách ảnh cũ làm mặc định
                    imagePreviews: previews
                });
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
            setToast({ message: "Không tìm thấy thông tin sản phẩm này!", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchProductData();
    }, [id, fetchProductData]);

    // --- BƯỚC 2: XỬ LÝ KHI BẠN CHỌN ẢNH MỚI (NẾU CẦN) ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return; // Nếu ko chọn gì thì giữ nguyên ảnh cũ

        const newBase64s = [];
        files.forEach((file) => {
            if (file.size > 2 * 1024 * 1024) return; // Chặn file > 2MB

            const reader = new FileReader();
            reader.onloadend = () => {
                newBase64s.push(reader.result);
                if (newBase64s.length === files.length) {
                    // Cập nhật state với dàn ảnh mới hoàn toàn
                    setFormData(prev => ({
                        ...prev,
                        images: newBase64s, 
                        imagePreviews: newBase64s
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // --- BƯỚC 3: LƯU THAY ĐỔI ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Chỉ gửi những gì đang có trong state (bao gồm cả cũ và mới đã sửa)
            const res = await axios.post(API_ENDPOINTS.UPDATE_PRODUCT, {
                id: id,
                name: formData.name,
                price: formData.price,
                description: formData.description,
                image: JSON.stringify(formData.images) // Đóng gói mảng ảnh gửi về Backend
            });

            if (res.data.errorCode === 0) {
                setToast({ message: "Đã cập nhật thông tin xe!", type: "success" });
                setTimeout(() => navigate('/products'), 1500);
            }
        } catch (error) {
            setToast({ message: "Lỗi khi lưu dữ liệu!", type: "error" });
        }
    };

    if (loading) return <div className="text-center py-5">Đang tải dữ liệu cũ...</div>;

    return (
        <div className="container py-5 main-content">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="card shadow-sm border-0 p-4" style={{ borderRadius: '20px' }}>
                <h3 className="fw-bold mb-4 text-primary">Chỉnh sửa thông tin xe</h3>

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="fw-bold small mb-1">Tên xe</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.name} // Tự động hiển thị tên cũ
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="fw-bold small mb-1">Giá bán (VND)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={formData.price} // Tự động hiển thị giá cũ
                                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="fw-bold small mb-1">Mô tả sản phẩm</label>
                        <textarea 
                            className="form-control" 
                            rows="4" 
                            value={formData.description} // Tự động hiển thị mô tả cũ
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold small mb-1">Hình ảnh (Chỉ chọn nếu muốn thay đổi)</label>
                        <input type="file" className="form-control" multiple onChange={handleImageChange} accept="image/*" />
                        
                        {/* Khu vực hiển thị ảnh đang có */}
                        <div className="d-flex gap-2 mt-3 flex-wrap">
                            {formData.imagePreviews.map((src, index) => (
                                <img key={index} src={src} className="rounded border shadow-sm" 
                                     style={{ width: '80px', height: '80px', objectFit: 'cover' }} alt="preview" />
                            ))}
                        </div>
                    </div>

                    <div className="d-flex gap-2 border-top pt-4">
                        <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold">Lưu thay đổi</button>
                        <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => navigate(-1)}>Quay lại</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;