import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
            <div className="container text-center text-md-start">
                <div className="row">
                    {/* Giới thiệu */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold text-primary">🚗 Tuấn Anh  Store</h5>
                        <p className="small">
                            Chuyên cung cấp các dòng xe và phụ kiện cao cấp. 
                            Uy tín - Chất lượng - Tận tâm là phương châm hàng đầu của chúng tôi.
                        </p>
                    </div>

                    {/* Danh mục sản phẩm */}
                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 font-weight-bold">Danh mục</h6>
                        <p><Link to="/products" className="text-white text-decoration-none small">Sản phẩm</Link></p>
                        <p><Link to="/brands" className="text-white text-decoration-none small">Thương hiệu</Link></p>
                        <p><Link to="/orders" className="text-white text-decoration-none small">Đơn hàng</Link></p>
                    </div>

                    {/* Hỗ trợ khách hàng */}
                    <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 font-weight-bold">Hỗ trợ</h6>
                        <p><Link to="#" className="text-white text-decoration-none small">Chính sách bảo hành</Link></p>
                        <p><Link to="#" className="text-white text-decoration-none small">Giao hàng & Đổi trả</Link></p>
                        <p><Link to="#" className="text-white text-decoration-none small">FAQs</Link></p>
                    </div>

                    {/* Liên hệ */}
                    <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 font-weight-bold">Liên hệ</h6>
                        <p className="small"><i className="bi bi-house-door-fill me-2"></i> phamtuananh19092004@gmail.com</p>
                        <p className="small"><i className="bi bi-envelope-fill me-2"></i> support@hotrokhachhang.com</p>
                        <p className="small"><i className="bi bi-telephone-fill me-2"></i> +84 387 301 909</p>
                    </div>
                </div>

                <hr className="mb-4" />

                <div className="row align-items-center">
                    <div className="col-md-7 col-lg-8">
                        <p className="small"> 
                            © {new Date().getFullYear()} All rights reserved by:
                            <strong className="text-primary"> Tuấn Anh Team</strong>
                        </p>
                    </div>

                    {/* Mạng xã hội */}
                    <div className="col-md-5 col-lg-4 text-center text-md-end">
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2"><i className="bi bi-facebook"></i></a>
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2"><i className="bi bi-twitter"></i></a>
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2"><i className="bi bi-google"></i></a>
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle"><i className="bi bi-instagram"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;