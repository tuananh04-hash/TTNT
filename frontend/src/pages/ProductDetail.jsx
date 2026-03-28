import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import { API_ENDPOINTS } from '../config/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:3030";
    const user = JSON.parse(localStorage.getItem('user'));

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [allImages, setAllImages] = useState([]);

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [canReview, setCanReview] = useState(false); 

    // 1. Lấy đánh giá của ĐÚNG sản phẩm này
    const fetchReviews = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.GET_REVIEWS(id));
            if (res.data.errorCode === 0) setReviews(res.data.data);
        } catch (err) {
            console.error("Lỗi lấy đánh giá:", err);
        }
    };

    // 2. Kiểm tra quyền đánh giá (Đã mua + Đã giao hàng)
    const checkUserPermission = async () => {
        if (!user) return;
        try {
            // Sửa lại URL cho khớp với Backend router
            const res = await axios.get(`${BASE_URL}/api/v1/check-can-review`, {
                params: { productId: id, userId: user.id }
            });
            if (res.data.errorCode === 0) setCanReview(res.data.canReview);
        } catch (err) { console.error("Lỗi check quyền:", err); }
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");
        setSubmitting(true);
        try {
            const res = await axios.post(API_ENDPOINTS.POST_REVIEW, {
                productId: id,
                userId: user.id,
                userName: user.name,
                rating: Number(rating),
                comment
            });
            if (res.data.errorCode === 0) {
                alert("✅ Cảm ơn bạn đã gửi đánh giá!");
                setComment(""); setRating(5); fetchReviews();
            }
        } catch (err) { alert("❌ Lỗi gửi đánh giá"); }
        finally { setSubmitting(false); }
    };

    const addToCart = () => {
        if (!product) return;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(i => i.id === product.id);
        if (index > -1) cart[index].quantity++;
        else cart.push({ ...product, quantity: 1, image: mainImage });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert("✅ Đã thêm vào giỏ hàng!");
    };

    const getImagesArray = (str) => {
        try { 
            if (typeof str === 'string' && str.startsWith('[')) return JSON.parse(str);
            return [str];
        } catch { return [str]; }
    };

    const formatImgSrc = (img) => img?.startsWith('data:') ? img : `${BASE_URL}/images/${img}`;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
                if (res.data.errorCode === 0) {
                    const data = res.data.data;
                    setProduct(data);
                    const imgs = getImagesArray(data.image);
                    setAllImages(imgs);
                    setMainImage(formatImgSrc(imgs[0]));
                }
                await fetchReviews();
                await checkUserPermission();
            } finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    if (loading) return <Loading />;
    if (!product) return <div className="container py-5 text-center"><h3>❌ Không tìm thấy sản phẩm</h3></div>;

    const avg = reviews.length ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 5;

    return (
        <div className="container py-5">
            <div className="row g-5">
                {/* --- KHỐI ẢNH --- */}
                <div className="col-lg-6">
                    <div className="border rounded-4 overflow-hidden mb-3 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                        <img src={mainImage} className="img-fluid" alt={product.name} style={{ maxHeight: '450px' }} />
                    </div>
                    <div className="d-flex gap-2 mt-2">
                        {allImages.map((img, i) => (
                            <img key={i} src={formatImgSrc(img)} width={80} height={80}
                                className={`rounded border ${mainImage === formatImgSrc(img) ? 'border-primary border-2' : ''}`}
                                style={{ cursor: 'pointer', objectFit: 'cover' }}
                                onClick={() => setMainImage(formatImgSrc(img))} />
                        ))}
                    </div>
                </div>

                {/* --- THÔNG TIN CHI TIẾT --- */}
                <div className="col-lg-6">
                    <h1 className="fw-bold">{product.name}</h1>
                    <div className="mb-2 d-flex align-items-center">
                        <span className="text-warning me-2 fs-5">
                            {[1, 2, 3, 4, 5].map(i => i <= Math.round(avg) ? '★' : '☆')}
                        </span>
                        <span className="text-muted">({reviews.length} đánh giá)</span>
                    </div>
                    <h2 className="text-danger fw-bold mb-4">{Number(product.price).toLocaleString()}đ</h2>
                    
                    <div className="card border-0 bg-light p-3 mb-4 rounded-3 shadow-sm">
                        <h6 className="fw-bold mb-2">📄 Mô tả sản phẩm:</h6>
                        <div style={{ whiteSpace: 'pre-line', color: '#555' }}>
                            {product.description || "Đang cập nhật..."}
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg rounded-pill w-100 shadow-sm" onClick={addToCart}>
                         Thêm vào giỏ hàng
                    </button>
                </div>
            </div>

            <hr className="my-5" />

            {/* --- PHẦN ĐÁNH GIÁ --- */}
            <div className="row mt-5">
                <div className="col-lg-8 mx-auto">
                    <h3 className="fw-bold mb-4 text-center">Phản hồi khách hàng</h3>

                    {!user ? (
                        <div className="alert alert-info text-center rounded-pill">
                             Vui lòng <b style={{cursor:'pointer'}} onClick={()=>navigate('/locgin')}>Đăng nhập</b> để đánh giá.
                        </div>
                    ) : canReview ? (
                        <div className="card p-4 mb-5 shadow-sm border-0 bg-white rounded-4">
                            <h5 className="fw-bold mb-3">Trải nghiệm của bạn</h5>
                            <div style={{ fontSize: '35px', color: '#ffc107' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{ cursor: 'pointer' }}>
                                        {star <= (hoverRating || rating) ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                            <textarea className="form-control mb-3 mt-2 border-0 bg-light" rows="3"
                                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                                value={comment} onChange={e => setComment(e.target.value)}
                            />
                            <button className="btn btn-primary rounded-pill px-5 fw-bold"
                                disabled={submitting} onClick={handleSubmitReview}>
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    ) : (
                        <div > </div>
                    )}

                    <div className="review-list">
                        {reviews.length === 0 ? <p className="text-center text-muted">Chưa có đánh giá nào.</p> : 
                        reviews.map((r, i) => (
                            <div key={i} className="mb-4 p-3 border-bottom d-flex align-items-start">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{width:'45px', height:'45px', fontWeight:'bold'}}>
                                    {r.user_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="fw-bold">{r.user_name} <span className="badge bg-success-subtle text-success ms-2" style={{fontSize:'10px'}}>✓ Đã mua hàng</span></div>
                                        <small className="text-muted">{new Date(r.created_at).toLocaleDateString('vi-VN')}</small>
                                    </div>
                                    <div className="text-warning small mb-2">
                                        {[...Array(5)].map((_, j) => <span key={j}>{j < r.rating ? '★' : '☆'}</span>)}
                                    </div>
                                    <p className="text-secondary mb-0">{r.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;