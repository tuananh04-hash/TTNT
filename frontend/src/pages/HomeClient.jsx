import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- IMPORT SWIPER ---
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// --- IMPORT SWIPER STYLES ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../config/api';

const HomeClient = () => {
    const navigate = useNavigate();
    const [newProducts, setNewProducts] = useState([]);
    const [hotProducts, setHotProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_URL = "http://localhost:3030";

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

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.HOME_CLIENT);
                if (res.data.errorCode === 0) {
                    const processedNew = (res.data.data.newProducts || []).map(p => ({
                        ...p, displayImg: getSafeImage(p.image)
                    }));
                    const processedHot = (res.data.data.hotProducts || []).map(p => ({
                        ...p, displayImg: getSafeImage(p.image)
                    }));
                    setNewProducts(processedNew);
                    setHotProducts(processedHot);
                }
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const swiperOptions = {
        modules: [Autoplay, Pagination, Navigation],
        spaceBetween: 30,
        slidesPerView: 1.2,
        loop: true,
        speed: 1200,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false, 
            pauseOnMouseEnter: true,
        },
        pagination: { clickable: true, dynamicBullets: true },
        navigation: true,
        breakpoints: {
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 }, // HIỆN 3 SẢN PHẨM TRÊN MÁY TÍNH
        }
    };

    const renderProductItem = (product, isNew = false, isHot = false) => {
        const imgPath = product.displayImg;
        const finalImgSrc = imgPath && imgPath.startsWith('data:') 
            ? imgPath : imgPath ? `${BASE_URL}/images/${imgPath}` 
            : "https://placehold.co/400x300?text=No+Image";

        return (
            <div className="clean-card shadow-sm">
                <div className="img-box">
                    {isHot && <span className="m-badge hot">HOT</span>}
                    {isNew && <span className="m-badge new">NEW</span>}
                    <ProductCard product={{...product, image: finalImgSrc}} />
                    <div className="overlay-minimal" onClick={() => navigate(`/product-detail/${product.id}`)}>
                        <button className="btn-minimal">XEM CHI TIẾT</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="home-minimal-layout">
            <style>{`
                .home-minimal-layout { background: #fcfcfc; padding-bottom: 70px; }
                
                /* KHÔI PHỤC HERO SECTION */
                .hero-section {
                    min-height: 60vh;
                    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), 
                                url("https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop") center/cover;
                    display: flex; align-items: center; justify-content: center; color: white;
                    border-radius: 0 0 80px 80px; margin-bottom: 40px; text-align: center;
                }

                .section-header {
                    margin: 50px 0 20px 0;
                    font-size: 1.5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .clean-card {
                    background: #fff; border-radius: 12px; overflow: hidden;
                    transition: 0.4s ease; border: 1px solid #eee;
                }
                .clean-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important; }

                .img-box { position: relative; width: 100%; cursor: pointer; }
                .m-badge {
                    position: absolute; top: 12px; padding: 3px 10px;
                    font-size: 10px; font-weight: 800; border-radius: 4px; z-index: 2;
                }
                .hot { background: #ff4757; color: #fff; right: 12px; }
                .new { background: #0066ff; color: #fff; left: 12px; }

                .overlay-minimal {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.02);
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: 0.3s;
                }
                .clean-card:hover .overlay-minimal { opacity: 1; }

                .btn-minimal {
                    background: #000; color: #fff; border: none;
                    padding: 10px 25px; border-radius: 50px;
                    font-size: 0.75rem; font-weight: 700;
                }

                .swiper-button-next, .swiper-button-prev { color: #000 !important; transform: scale(0.6); background: #fff; width: 50px; height: 50px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .swiper-pagination-bullet-active { background: #000 !important; }
                .swiper { padding-bottom: 50px !important; }
            `}</style>

            {/* PHẦN TRÊN CÙNG ĐÃ ĐƯỢC THÊM LẠI */}
            <section className="hero-section">
                <div className="container">
                    <h1 className="display-2 fw-bold mb-3">TUẤN ANH STORE</h1>
                    <p className="fs-4 mb-4 opacity-75">Hệ thống phân phối xe đạp cao cấp số 1 Việt Nam</p>
                    <button onClick={() => navigate('/store')} className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg border-0">
                        KHÁM PHÁ NGAY <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            </section>

            <div className="container">
                <h2 className="section-header" style={{color :'#d15c5e' }}>✨ SẢN PHẨM MỚI </h2>
                {!loading && newProducts.length > 0 ? (
                    <Swiper key={`new-${newProducts.length}`} {...swiperOptions}>
                        {newProducts.map(p => (
                            <SwiperSlide key={p.id}>{renderProductItem(p, true, false)}</SwiperSlide>
                        ))}
                    </Swiper>
                ) : <div className="text-center py-5">Đang tải...</div>}

                <h2 className="section-header" style={{color: '#ff4757'}}>🔥 Best Sellers</h2>
                {!loading && hotProducts.length > 0 ? (
                    <Swiper key={`hot-${hotProducts.length}`} {...swiperOptions} autoplay={{ delay: 4000 }}>
                        {hotProducts.map(p => (
                            <SwiperSlide key={p.id}>{renderProductItem(p, false, true)}</SwiperSlide>
                        ))}
                    </Swiper>
                ) : <div className="text-center py-5">Đang tải...</div>}
            </div>
        </div>
    );
};

export default HomeClient;