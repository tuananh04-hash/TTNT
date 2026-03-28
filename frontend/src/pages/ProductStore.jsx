import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { API_ENDPOINTS } from '../config/api';

const ProductStore = () => {
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:3030";

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Cấu hình filter với minPrice và maxPrice
    const [filter, setFilter] = useState({ 
        brand: 'All', 
        search: '', 
        priceRange: 'all', // Giá trị: 'all', 'under5', '5to10', '10to20', 'over20'
        sort: 'newest' 
    });

    const getSafeImage = (imageString) => {
        if (!imageString) return null;
        let data = imageString.trim();
        try {
            if (data.startsWith('"') && data.endsWith('"')) data = JSON.parse(data);
            if (data.startsWith('[')) {
                if (!data.endsWith(']')) {
                    const lastQuoteIndex = data.lastIndexOf('"');
                    data = data.substring(0, lastQuoteIndex + 1) + ']';
                }
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
            }
            return data;
        } catch (e) {
            const match = data.match(/data:image\/[^;]+;base64,[^"']+/);
            return match ? match[0] : null;
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.BRANDS_LIST || API_ENDPOINTS.BRANDS);
            if (res.data && res.data.errorCode === 0) setBrands(res.data.data);
        } catch (err) { console.error("Lỗi:", err); }
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        // Logic xử lý khoảng giá để gửi lên Backend
        let min = 0;
        let max = 200000000;
        if (filter.priceRange === 'under5') max = 5000000;
        else if (filter.priceRange === '5to10') { min = 5000000; max = 10000000; }
        else if (filter.priceRange === '10to20') { min = 10000000; max = 20000000; }
        else if (filter.priceRange === 'over20') min = 20000000;

        try {
            const response = await axios.get(API_ENDPOINTS.HOME_PRODUCT_LIST, {
                params: {
                    name: filter.search,
                    brand: filter.brand === 'All' ? '' : filter.brand,
                    minPrice: min,
                    maxPrice: max,
                    sort: filter.sort
                }
            });
            if (response.data?.errorCode === 0) setProducts(response.data.data);
        } catch (err) { console.error("Lỗi:", err); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { fetchBrands(); }, []);
    useEffect(() => {
        const timer = setTimeout(() => { fetchProducts(); }, 400);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const addToCart = (e, p) => {
        e.stopPropagation(); // Ngăn việc nhấn nút "Thêm" bị nhảy vào trang chi tiết
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.id === p.id);
        if (index > -1) cart[index].quantity += 1;
        else cart.push({ ...p, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`Đã thêm ${p.name} vào giỏ hàng!`);
    };

    return (
        <div className="store-premium-v2">
            <style>{`
                .store-premium-v2 { background: #fbfbfd; min-height: 100vh; padding: 40px 0; font-family: "SF Pro Display", -apple-system, sans-serif; }
                
                .store-title { font-size: 2.8rem; font-weight: 700; color: #1d1d1f; margin-bottom: 40px; letter-spacing: -0.022em; }

                /* Bộ lọc phong cách hiện đại */
                .filter-container {
                    background: white; border-radius: 24px; padding: 25px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 50px;
                    border: 1px solid #f2f2f2;
                }
                .filter-item label { font-size: 0.8rem; font-weight: 600; color: #86868b; margin-bottom: 8px; display: block; padding-left: 10px; }
                .select-apple {
                    width: 100%; border-radius: 12px; border: 1px solid #d2d2d7;
                    padding: 12px; background: #fff; font-size: 0.95rem; cursor: pointer;
                    transition: 0.3s;
                }
                .select-apple:hover { border-color: #86868b; }

                /* Lưới sản phẩm */
                .bike-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 30px; }
                @media (min-width: 768px) { .bike-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1200px) { .bike-grid { grid-template-columns: repeat(3, 1fr); } }

                /* Card xe đạp: Toàn bộ vùng là link */
                .bike-card-apple {
                    background: #fff; border-radius: 28px; overflow: hidden;
                    transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
                    cursor: pointer; position: relative; border: 1px solid transparent;
                }
                .bike-card-apple:hover {
                    transform: scale(1.02);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.12);
                    border-color: #f2f2f2;
                }

                .img-box {
                    width: 100%; aspect-ratio: 1/1; display: flex; align-items: center;
                    justify-content: center; padding: 40px; background: #fff;
                }
                .img-box img { max-width: 100%; max-height: 100%; object-fit: contain; transition: 0.6s ease; }
                .bike-card-apple:hover .img-box img { transform: scale(1.08); }

                .info-box { padding: 0 30px 30px 30px; text-align: center; }
                .b-brand { font-size: 0.75rem; color: #0071e3; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
                .b-name { font-size: 1.4rem; font-weight: 600; color: #1d1d1f; margin-bottom: 10px; }
                .b-price { font-size: 1.15rem; color: #424245; font-weight: 500; margin-bottom: 25px; }

                .btn-add-apple {
                    background: #1f68de; color: #eeeef5; border: none;
                    width: 100%; padding: 12px; border-radius: 12px;
                    font-weight: 600; transition: 0.3s;
                }
                .btn-add-apple:hover { background: #0071e3; color: white; }
            `}</style>

            <div className="container">
                <h1 className="store-title text-center">TẤT CẢ XE ĐẠP ĐỊA HÌNH </h1>

                {/* --- BỘ LỌC CẢI TIẾN --- */}
                <div className="filter-container">
                    <div className="row g-4">
                        <div className="col-md-4 filter-item">
                            <label>TÌM KIẾM</label>
                            <input type="text" className="select-apple" placeholder="Tên xe đạp..." 
                                value={filter.search} onChange={(e) => setFilter({...filter, search: e.target.value})} />
                        </div>
                        <div className="col-md-3 filter-item">
                            <label>HÃNG XE</label>
                            <select className="select-apple" value={filter.brand} onChange={(e) => setFilter({...filter, brand: e.target.value})}>
                                <option value="All">Tất cả hãng</option>
                                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3 filter-item">
                            <label>KHOẢNG GIÁ</label>
                            <select className="select-apple" value={filter.priceRange} onChange={(e) => setFilter({...filter, priceRange: e.target.value})}>
                                <option value="all">Mọi mức giá</option>
                                <option value="under5">Dưới 5 triệu</option>
                                <option value="5to10">Từ 5 - 10 triệu</option>
                                <option value="10to20">Từ 10 - 20 triệu</option>
                                <option value="over20">Trên 20 triệu</option>
                            </select>
                        </div>
                        <div className="col-md-2 filter-item">
                            <label>SẮP XẾP</label>
                            <select className="select-apple" value={filter.sort} onChange={(e) => setFilter({...filter, sort: e.target.value})}>
                                <option value="newest">Mới nhất</option>
                                <option value="priceLow">Giá thấp</option>
                                <option value="priceHigh">Giá cao</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- GRID SẢN PHẨM --- */}
                {loading ? <Loading /> : (
                    <div className="bike-grid">
                        {products.map((p) => {
                            const imgPath = getSafeImage(p.image);
                            const imgSrc = imgPath && imgPath.startsWith('data:') 
                                ? imgPath : imgPath ? `${BASE_URL}/images/${imgPath}` : "https://placehold.co/400x400?text=No+Image";

                            return (
                                <div className="bike-card-apple" key={p.id} onClick={() => navigate(`/product-detail/${p.id}`)}>
                                    <div className="img-box">
                                        <img src={imgSrc} alt={p.name} />
                                    </div>
                                    <div className="info-box">
                                        <p className="b-brand">{p.brand_name || 'TUẤN ANH STORE'}</p>
                                        <h3 className="b-name text-truncate">{p.name}</h3>
                                        <p className="b-price">{Number(p.price).toLocaleString('vi-VN')} VNĐ</p>
                                        
                                        <button className="btn-add-apple" onClick={(e) => addToCart(e, p)}>
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductStore;