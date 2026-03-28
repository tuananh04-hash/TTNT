
const ProductCard = ({ product }) => {
    const defaultImage = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=500&auto=format&fit=crop";

    return (
        <div className="card h-100 border-0 shadow-none bg-transparent">
            <div className="position-relative overflow-hidden" style={{ height: '180px', borderRadius: '12px' }}>
                <img 
                    src={product.image || defaultImage} 
                    className="card-img-top w-100 h-100" 
                    alt={product.name}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => { e.target.src = defaultImage; }}
                />
                {/* Đã xóa nhãn brand_name ở đây để giao diện thoáng hơn */}
            </div>
            
            <div className="card-body p-2 d-flex flex-column text-center">
                <h6 className="card-title fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>
                    {product.name}
                </h6>
                <p className="card-text text-danger fw-bold mb-0" style={{ fontSize: '0.85rem' }}>
                    {Number(product.price).toLocaleString('vi-VN')} VNĐ
                </p>
            </div>
        </div>
    );
};

export default ProductCard;