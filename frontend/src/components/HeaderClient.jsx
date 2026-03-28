import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy thông tin user an toàn
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : { name: 'Người dùng' };
    const token = localStorage.getItem('token');

    // Hàm kiểm tra active để đổi màu link
    const isActive = (path) => location.pathname === path 
        ? 'active fw-bold text-primary border-bottom border-3 border-primary' 
        : 'text-muted fw-medium';

    const handleLogout = () => {
        if(window.confirm("Bạn có chắc chắn muốn thoát hệ thống?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/locgin'); // Giữ nguyên 'locgin' theo cấu hình của bạn
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top py-2 shadow-sm bg-white admin-header">
            <style>{`
                .admin-header { backdrop-filter: blur(15px); background: rgba(255, 255, 255, 0.9) !important; }
                .nav-link { transition: all 0.3s; font-size: 0.95rem; }
                .nav-link:hover { color: #0d6efd !important; transform: translateY(-1px); }
                .extra-small { font-size: 0.7rem; }
                .glass-card { background: rgba(0, 119, 255, 0.05); border: 1px solid rgba(0, 119, 255, 0.1); }
                .shadow-glow { box-shadow: 0 0 15px rgba(0, 119, 255, 0.2); }
                .text-gradient-ocean {
                    background: linear-gradient(45deg, #0d6efd, #00d2ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                }
            `}</style>

            <div className="container">
                {/* Logo thương hiệu */}
                <Link className="navbar-brand d-flex align-items-center" to="/shop-home">
                    <div className="bg-primary rounded-3 p-1 me-2 shadow-glow animate__animated animate__pulse animate__infinite">
                        <i className="bi bi-bicycle text-white fs-4 px-1"></i>
                    </div>
                    <div className="d-flex flex-column">
                        <span className="text-gradient-ocean fs-5 mb-0" style={{lineHeight: 1.1}}>TUÂN ANH STORE</span>
                    </div>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item px-1">
                            <Link className={`nav-link ${isActive('/shop-home')}`} to="/shop-home">Trang chủ</Link>
                        </li>
                        <li className="nav-item px-1">
                            <Link className={`nav-link ${isActive('/store')}`} to="/store">Sản phẩm</Link>
                        </li>
                        <li className="nav-item px-1">
                            <Link className={`nav-link ${isActive('/contact')}`} to="/contact">Liên hệ</Link>
                        </li>
                        <li className="nav-item px-1">
                            {/* Đã sửa từ /my-order thành /my-orders để khớp với App.js */}
                            <Link className={`nav-link ${isActive('/my-orders')}`} to="/my-orders">Theo dõi đơn hàng</Link>
                        </li>
                        <li className="nav-item px-1">
                            <Link className={`nav-link ${isActive('/services')}`} to="/services">Dịch vụ</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {/* Giỏ hàng */}
                        <Link to="/cart" className="btn btn-sm btn-outline-primary rounded-pill px-3 d-none d-lg-flex align-items-center">
                            <i className="bi bi-cart3 me-2"></i> Giỏ hàng
                        </Link>

                        {!token ? (
                            <Link to="/locgin" className="btn btn-primary rounded-pill px-4 fw-bold btn-sm shadow-sm">
                                Đăng nhập
                            </Link>
                        ) : (
                            <div className="dropdown">
                                <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle text-dark glass-card p-1 pe-3 rounded-pill shadow-sm" 
                                   id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0d6efd&color=fff&bold=true`} 
                                         alt="avatar" width="32" height="32" className="rounded-circle me-2 shadow-sm" />
                                    <div className="d-none d-sm-block text-start">
                                        <div className="fw-bold small mb-0" style={{lineHeight: 1}}>{user.name}</div>
                                        <span className="extra-small text-success fw-bold">● Trực tuyến</span>
                                    </div>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 rounded-4 p-2">
                                    <li><h6 className="dropdown-header small text-uppercase fw-bold opacity-50">Tài khoản</h6></li>
                                    <li><Link className="dropdown-item py-2 rounded-3" to="/profile">
                                        <i className="bi bi-person me-2 text-primary"></i>Hồ sơ cá nhân
                                    </Link></li>
                                    <li><Link className="dropdown-item py-2 rounded-3" to="/">
                                        <i className="bi bi-speedometer2 me-2 text-primary"></i>Trang quản trị
                                    </Link></li>
                                    <li><hr className="dropdown-divider opacity-50" /></li>
                                    <li>
                                        <button onClick={handleLogout} className="dropdown-item py-2 rounded-3 text-danger fw-bold">
                                            <i className="bi bi-power me-2"></i> Thoát hệ thống
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;