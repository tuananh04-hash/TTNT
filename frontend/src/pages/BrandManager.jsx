import axios from 'axios';
import { useEffect, useState } from 'react';
import '../App.css';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const BrandManager = () => {
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State cho ô tìm kiếm
    const [formData, setFormData] = useState({ name: '', country: '', logo: '' });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_ENDPOINTS.BRANDS);
            if (res.data.errorCode === 0) {
                setBrands(res.data.data);
            } else {
                setError("Không thể tải danh sách");
            }
        } catch (err) {
            setError("Lỗi kết nối Server!");
        } finally {
            setLoading(false);
        }
    };

    // --- Logic tìm kiếm Offline ---
    const filteredBrands = brands.filter(brand => {
        const searchStr = searchTerm.toLowerCase();
        return (
            brand.name?.toLowerCase().includes(searchStr) || 
            brand.country?.toLowerCase().includes(searchStr) ||
            brand.id?.toString().includes(searchStr)
        );
    });

    const handleEditClick = (brand) => {
        setIsEditing(true);
        setCurrentId(brand.id);
        setFormData({ name: brand.name, country: brand.country || '', logo: brand.logo || '' });
        window.scrollTo(0, 0);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ name: '', country: '', logo: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (isEditing) {
                res = await axios.post(API_ENDPOINTS.UPDATE_BRAND, { ...formData, id: currentId });
            } else {
                res = await axios.post(API_ENDPOINTS.CREATE_BRAND, formData);
            }

            if (res.data.errorCode === 0) {
                setToast({ message: isEditing ? "Đã cập nhật!" : "Đã thêm mới!", type: 'success' });
                handleCancel();
                fetchBrands();
            }
        } catch (err) {
            setToast({ message: "Thao tác thất bại!", type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa thương hiệu này?")) return;
        try {
            const res = await axios.post(API_ENDPOINTS.DELETE_BRAND, { id });
            if (res.data.errorCode === 0) {
                setToast({ message: "Đã xóa!", type: 'success' });
                fetchBrands();
            }
        } catch (err) {
            setToast({ message: "Lỗi khi xóa!", type: 'error' });
        }
    };

    return (
        <div className="container py-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">🏷️ Quản Lý Thương Hiệu</h2>
                {/* --- Thanh tìm kiếm --- */}
                <div className="search-box w-25">
                    <input 
                        type="text" 
                        className="form-control shadow-sm" 
                        placeholder="🔍 Tìm thương hiệu..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Form Thêm / Sửa */}
            <div className={`card p-4 mb-4 border-0 shadow-sm border-start border-4 ${isEditing ? 'border-warning' : 'border-primary'}`}>
                <h5 className="fw-bold mb-3">{isEditing ? "📝 Sửa Thương Hiệu" : "➕ Thêm Thương Hiệu"}</h5>
                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-4">
                        <input type="text" className="form-control" placeholder="Tên hãng..." 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                        <input type="text" className="form-control" placeholder="Quốc gia" 
                            value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                    <div className="col-md-4 d-flex gap-2">
                        <button className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'} fw-bold flex-grow-1`}>
                            {isEditing ? 'Cập Nhật' : 'Thêm Mới'}
                        </button>
                        {isEditing && <button type="button" className="btn btn-secondary" onClick={handleCancel}>Hủy</button>}
                    </div>
                    <div className="col-12"> 
                        <input type="text" className="form-control" placeholder="Link ảnh Logo..."
                            value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} />
                    </div>
                </form>
            </div>

            {loading ? <Loading /> : (
                <div className="row">
                    {/* Render từ filteredBrands đã lọc */}
                    {filteredBrands.length > 0 ? filteredBrands.map(brand => (
                        <div className="col-md-3 mb-4" key={brand.id}>
                            <div className="card h-100 text-center border-0 shadow-sm p-3">
                                <div className="brand-logo-circle mb-3 mx-auto shadow-sm d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px', overflow: 'hidden', backgroundColor: '#f8f9fa'}}>
                                    {brand.logo ? <img src={brand.logo} alt={brand.name} style={{width: '100%', objectFit: 'contain'}} /> : <span className="fs-3 fw-bold">{brand.name.charAt(0)}</span>}
                                </div>
                                <h5 className="fw-bold">{brand.name}</h5>
                                <p className="text-muted small mb-3">{brand.country || 'N/A'}</p>
                                <div className="d-flex gap-2 justify-content-center mt-auto">
                                    <button onClick={() => handleEditClick(brand)} className="btn btn-sm btn-outline-warning">Sửa</button>
                                    <button onClick={() => handleDelete(brand.id)} className="btn btn-sm btn-outline-danger">Xóa</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center text-muted py-5">
                            <p>Không tìm thấy thương hiệu nào phù hợp.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrandManager;