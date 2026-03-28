import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const ProductList = () => {
    // --- 1. KHỞI TẠO STATE ---
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const BASE_URL = "http://localhost:3030";

    const [formData, setFormData] = useState({
        name: '', price: '', description: '', 
        brand_id: '', 
        images: [], 
        imagePreviews: []
    });

    // --- 2. LOGIC LẤY DỮ LIỆU ---
    const fetchProducts = useCallback(async (query = '') => {
        setLoading(true);
        try {
            const url = query 
                ? `${API_ENDPOINTS.ADMIN_PRODUCTS}?search=${encodeURIComponent(query)}` 
                : API_ENDPOINTS.ADMIN_PRODUCTS;
            const res = await axios.get(url);
            if (res.data?.errorCode === 0) setProducts(res.data.data);
        } catch (error) {
            console.error("Lỗi fetch sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.BRANDS_LIST || API_ENDPOINTS.BRANDS);
            if (res.data?.errorCode === 0) setBrands(res.data.data);
        } catch (error) {
            console.error("Lỗi fetch brands:", error);
        }
    };

    useEffect(() => {
        fetchBrands();
        const delayDebounceFn = setTimeout(() => fetchProducts(searchTerm), 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchProducts]);

    // --- 3. CÁC HÀM THAO TÁC (SỬA/XÓA) ---
    const handleEdit = (productId) => {
        if (!productId) return;
        window.location.href = `/edit-product/${productId}`;
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('❗ Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        setDeletingId(productId);
        try {
            const res = await axios.post(API_ENDPOINTS.DELETE_PRODUCT, { productId });
            if (res.data.errorCode === 0) {
                setToast({ message: '✅ Xóa thành công!', type: 'success' });
                setProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (error) {
            setToast({ message: '❌ Lỗi khi xóa (Sản phẩm có thể đang trong đơn hàng)!', type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    // --- 4. XỬ LÝ FORM ---
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const selectedFiles = Array.from(files);
            const base64Images = [];
            selectedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    base64Images.push(reader.result);
                    if (base64Images.length === selectedFiles.length) {
                        setFormData(prev => ({ ...prev, images: base64Images, imagePreviews: base64Images }));
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.brand_id) {
            setToast({ message: '❌ Vui lòng điền đủ Tên, Giá và Brand!', type: 'error' });
            return;
        }
        setSubmitting(true);
        try {
            const requestData = {
                ...formData,
                price: parseFloat(formData.price),
                brand_id: parseInt(formData.brand_id),
                image: JSON.stringify(formData.images) 
            };
            const res = await axios.post(API_ENDPOINTS.CREATE_PRODUCT, requestData);
            if (res.data.errorCode === 0) {
                setToast({ message: '✅ Thêm sản phẩm thành công!', type: 'success' });
                setFormData({ name: '', price: '', description: '', brand_id: '', images: [], imagePreviews: [] });
                setShowForm(false);
                fetchProducts();
            }
        } catch (err) {
            setToast({ message: '❌ Lỗi hệ thống khi lưu!', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Hàm xử lý ảnh an toàn
    const getSafeImage = (imageString) => {
        if (!imageString) return null;
        try {
            let data = imageString.trim();
            if (data.startsWith('"')) data = JSON.parse(data);
            if (data.startsWith('[')) {
                if (!data.endsWith(']')) data += '"]';
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed[0] : null;
            }
            return data;
        } catch (e) {
            const match = imageString.match(/data:image\/[^;]+;base64,[^"']+/);
            return match ? match[0] : null;
        }
    };

    const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="product-list-container container py-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">🛍️ Quản lý sản phẩm</h2>
                <div className="d-flex gap-2">
                    <input type="text" className="form-control" placeholder="Tìm tên xe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-success rounded-pill px-4">
                        {showForm ? 'Đóng' : '+ Thêm xe mới'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card p-4 mb-4 shadow-sm border-0" style={{ borderRadius: '15px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="small fw-bold">Tên xe *</label>
                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold">Thương hiệu *</label>
                                <select className="form-select" name="brand_id" value={formData.brand_id} onChange={handleInputChange} required>
                                    <option value="">-- Chọn Brand --</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold">Giá bán *</label>
                                <input type="number" className="form-control" name="price" value={formData.price} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold">Hình ảnh</label>
                                <input type="file" className="form-control" onChange={handleInputChange} multiple />
                            </div>
                            <div className="col-12">
                                <label className="small fw-bold">Mô tả sản phẩm</label>
                                <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Nhập mô tả chi tiết..."></textarea>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary mt-3 px-5 rounded-pill" disabled={submitting}>
                            {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                        </button>
                    </form>
                </div>
            )}

            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Ảnh</th>
                                <th>Tên xe</th>
                                <th>Giá</th>
                                <th>Mô tả</th> {/* DÒNG MÔ TẢ ĐÃ QUAY LẠI */}
                                <th className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td className="ps-4 text-muted">#{p.id}</td>
                                    <td>
                                        <img 
                                            src={getSafeImage(p.image)?.startsWith('data:') ? getSafeImage(p.image) : `${BASE_URL}/images/${getSafeImage(p.image)}`} 
                                            width="50" height="50" className="object-fit-cover rounded shadow-sm" 
                                            onError={(e) => { e.target.src='https://placehold.co/50'; }} 
                                        />
                                    </td>
                                    <td className="fw-bold">{p.name}</td>
                                    <td><span className="badge bg-primary-subtle text-primary">{formatVND(p.price)}</span></td>
                                    <td className="small text-muted" style={{ maxWidth: '200px' }}>
                                        {p.description ? (p.description.length > 50 ? p.description.substring(0, 50) + "..." : p.description) : 'Không có mô tả'}
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <button onClick={() => handleEdit(p.id)} className="btn btn-sm btn-outline-primary">Sửa</button>
                                            <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-outline-danger" disabled={deletingId === p.id}>
                                                {deletingId === p.id ? '...' : 'Xóa'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;