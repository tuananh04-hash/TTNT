import { Link } from 'react-router-dom';

const Footerclient = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-primary border-4">
            <div className="container text-center text-md-start">
                <div className="row">
                    {/* Giới thiệu */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold text-primary">🚲 Tuấn Anh Store</h5>
                        <p className="small lh-lg opacity-75">
                            Chuyên cung cấp các dòng xe và phụ kiện cao cấp. 
                            Uy tín - Chất lượng - Tận tâm là phương châm hàng đầu của chúng tôi trong việc chăm sóc xế yêu của bạn.
                        </p>
                    </div>

                    {/* Danh mục sản phẩm */}
                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 font-weight-bold border-bottom pb-2" style={{width: 'fit-content'}}>Khám phá</h6>
                        <p><Link hide-focus="true" to="/store" className="text-white text-decoration-none small hover-link">Cửa hàng xe</Link></p>
                        <p><Link to="/shop-home" className="text-white text-decoration-none small hover-link">Thương hiệu</Link></p>
                        <p><Link to="/my-orders" className="text-white text-decoration-none small hover-link">Đơn hàng của tôi</Link></p>
                    </div>

                    {/* Hỗ trợ khách hàng - ĐÃ CẬP NHẬT KHỚP VỚI TRANG SERVICES */}
                    <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 font-weight-bold border-bottom pb-2" style={{width: 'fit-content'}}>Dịch vụ</h6>
                        <p><Link to="/services" className="text-white text-decoration-none small hover-link">Đặt lịch bảo dưỡng</Link></p>
                        <p><Link to="/services" className="text-white text-decoration-none small hover-link">Chính sách bảo hành</Link></p>
                        <p><Link to="/services" className="text-white text-decoration-none small hover-link">Chính sách bảo mật</Link></p>
                        <p><Link to="/contact" className="text-white text-decoration-none small hover-link">Liên hệ hỗ trợ</Link></p>
                    </div>

                    {/* Liên hệ */}
                    <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 font-weight-bold border-bottom pb-2" style={{width: 'fit-content'}}>Liên hệ</h6>
                        <p className="small mb-2"><i className="bi bi-geo-alt-fill text-primary me-2"></i> Hà Nội, Việt Nam</p>
                        <p className="small mb-2"><i className="bi bi-envelope-fill text-primary me-2"></i> phamtuananh19092004@gmail.com</p>
                        <p className="small mb-2"><i className="bi bi-telephone-fill text-primary me-2"></i> +84 387 301 909</p>
                        <p className="small"><i className="bi bi-clock-fill text-primary me-2"></i> 08:00 - 21:00 (Hàng ngày)</p>
                    </div>
                </div>

                <hr className="mb-4 opacity-25" />

                <div className="row align-items-center">
                    <div className="col-md-7 col-lg-8 text-center text-md-start">
                        <p className="small mb-0"> 
                            © {new Date().getFullYear()} All rights reserved by:
                            <strong className="text-primary"> Tuấn Anh Store Team</strong>
                        </p>
                    </div>

                    {/* Mạng xã hội */}
                    <div className="col-md-5 col-lg-4 text-center text-md-end mt-3 mt-md-0">
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2 social-icon"><i className="bi bi-facebook"></i></a>
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2 social-icon"><i className="bi bi-twitter-x"></i></a>
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2 social-icon"><i className="bi bi-youtube"></i></a>
                        <a href="#" className="btn btn-outline-light btn-sm rounded-circle social-icon"><i className="bi bi-instagram"></i></a>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-link:hover {
                    color: #0d6efd !important;
                    padding-left: 5px;
                    transition: all 0.3s ease;
                }
                .social-icon:hover {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                    transform: translateY(-3px);
                    transition: all 0.3s ease;
                }
                .text-primary {
                    color: #0d6efd !important;
                }
            `}</style>
        </footer>
    );
};

export default Footerclient;