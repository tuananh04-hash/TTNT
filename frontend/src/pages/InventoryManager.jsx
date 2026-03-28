import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [activeTab, setActiveTab] = useState('stock');
    const [loading, setLoading] = useState(false);

    // Form nhập kho
    const [selectedBrand, setSelectedBrand] = useState('');
    const [importItems, setImportItems] = useState([{ product_id: '', quantity: 1, import_price: 0 }]);

    // Ngưỡng chặn rất cao để tránh lỗi nhưng không làm phiền người dùng
    const MAX_PRICE = 10000000000; // 10 tỷ
    const MAX_QUANTITY = 10000;    // 10 nghìn xe

    useEffect(() => {
        fetchProducts();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_ENDPOINTS.ADMIN_PRODUCTS);
            setProducts(res.data.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.SUPPLIERS);
            setBrands(res.data.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách thương hiệu:", err);
        }
    };

    const handleAddRow = () => {
        setImportItems([...importItems, { product_id: '', quantity: 1, import_price: 0 }]);
    };

    const handleRemoveRow = (index) => {
        if (importItems.length > 1) {
            const newItems = importItems.filter((_, i) => i !== index);
            setImportItems(newItems);
        } else {
            // Nếu chỉ còn 1 dòng thì reset dòng đó về mặc định
            setImportItems([{ product_id: '', quantity: 1, import_price: 0 }]);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...importItems];
        
        if (field === 'import_price') {
            // Loại bỏ mọi ký tự không phải số
            let num = parseInt(value.replace(/\D/g, '')) || 0;
            if (num > MAX_PRICE) num = MAX_PRICE; 
            newItems[index][field] = num;
        } 
        else if (field === 'quantity') {
            let qty = parseInt(value) || 0;
            if (qty > MAX_QUANTITY) qty = MAX_QUANTITY;
            newItems[index][field] = qty;
        } 
        else {
            newItems[index][field] = value;
        }
        setImportItems(newItems);
    };

    const handleImport = async () => {
        if (!selectedBrand) return alert("⚠️ Vui lòng chọn thương hiệu cung cấp!");
        
        const isInvalid = importItems.some(item => !item.product_id || item.quantity <= 0);
        if (isInvalid) return alert("⚠️ Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!");

        try {
            await axios.post(API_ENDPOINTS.CREATE_RECEIPT, {
                supplier_id: selectedBrand,
                items: importItems
            });
            
            alert("✅ Nhập kho thành công!");
            setImportItems([{ product_id: '', quantity: 1, import_price: 0 }]);
            setSelectedBrand('');
            fetchProducts(); 
            setActiveTab('stock'); 
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
        }
    };

    const totalValue = importItems.reduce((acc, item) => acc + (item.quantity * item.import_price), 0);

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white pt-3 border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold text-primary mb-0">QUẢN LÝ KHO</h4>
                        <div className="nav nav-pills bg-light p-1 rounded-3">
                            <button className={`nav-link px-4 ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>Xem Tồn Kho</button>
                            <button className={`nav-link px-4 ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>Nhập Xe Mới</button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4">
                    {activeTab === 'stock' ? (
                        <div className="table-responsive">
                            {loading ? <p className="text-center">Đang tải dữ liệu...</p> : (
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tên Xe</th>
                                            <th className="text-center">Số Lượng Tồn</th>
                                            <th>Trạng Thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td className="fw-bold">{product.name}</td>
                                                <td className="text-center fw-bold text-primary">{product.stock}</td>
                                                <td>
                                                    {product.stock <= 2 ? 
                                                        <span className="badge bg-danger">Cần nhập hàng ngay</span> : 
                                                        <span className="badge bg-success">Còn hàng</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                <label className="form-label fw-bold">Chọn Thương Hiệu Cung Cấp</label>
                                <select 
                                    className="form-select border-primary shadow-sm" 
                                    value={selectedBrand} 
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                >
                                    <option value="">-- Chọn Thương Hiệu --</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>

                            <div className="bg-light p-3 rounded-4 border border-dashed">
                                <label className="form-label fw-bold mb-3 text-secondary">Danh sách mặt hàng nhập</label>
                                {importItems.map((item, index) => (
                                    <div key={index} className="row g-2 mb-3 align-items-center bg-white p-2 rounded-3 shadow-sm mx-0">
                                        <div className="col-md-5">
                                            <select className="form-select border-0 bg-light" value={item.product_id}
                                                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}>
                                                <option value="">-- Chọn xe --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="input-group">
                                                <span className="input-group-text bg-transparent border-0 text-muted small">SL</span>
                                                <input type="number" className="form-control border-0 bg-light text-center fw-bold" 
                                                       value={item.quantity} 
                                                       onFocus={(e) => e.target.select()}
                                                       onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="input-group">
                                                <input type="text" className="form-control border-0 bg-light text-end fw-bold text-danger" 
                                                       value={item.import_price > 0 ? item.import_price.toLocaleString('vi-VN') : ''}
                                                       placeholder="0"
                                                       onFocus={(e) => e.target.select()}
                                                       onChange={(e) => handleItemChange(index, 'import_price', e.target.value)} />
                                                <span className="input-group-text bg-transparent border-0 text-muted">đ</span>
                                            </div>
                                        </div>
                                        <div className="col-md-1 text-center">
                                            <button className="btn btn-link text-danger p-0" onClick={() => handleRemoveRow(index)}>
                                                <i className="bi bi-trash-fill fs-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <button className="btn btn-outline-secondary btn-sm fw-bold border-2 rounded-pill px-3" onClick={handleAddRow}>
                                    <i className="bi bi-plus-lg"></i> THÊM DÒNG
                                </button>
                            </div>
                            
                            <div className="mt-4 p-4 bg-white border border-primary-subtle rounded-4 shadow-sm text-end">
                                <p className="mb-1 text-muted fw-bold">TỔNG GIÁ TRỊ PHIẾU NHẬP:</p>
                                <h2 className="fw-bold text-primary mb-4">{totalValue.toLocaleString('vi-VN')} <small className="text-muted fs-6">VNĐ</small></h2>
                                <button className="btn btn-primary btn-lg px-5 py-2 fw-bold shadow" onClick={handleImport}>
                                    <i className="bi bi-check2-all me-2"></i>XÁC NHẬN NHẬP KHO
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryManager;