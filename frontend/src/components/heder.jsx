import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy thông tin user an toàn
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : { name: 'Admin' };
    const token = localStorage.getItem('token');

    // --- CẬP NHẬT DANH SÁCH MENU BỔ SUNG DỊCH VỤ ---
    const menuItems = [
        { path: '/', label: 'Tổng quan', icon: 'bi-speedometer2' },
        { path: '/users', label: 'Thành viên', icon: 'bi-people' },
        { path: '/brands', label: 'Thương hiệu', icon: 'bi-tag' },
        { path: '/products', label: 'Sản phẩm', icon: 'bi-bicycle' },
        { path: '/orders', label: 'Đơn hàng', icon: 'bi-cart-check' },
        { path: '/inventory', label: 'Kho hàng', icon: 'bi-boxes' },
        
        // MỤC MỚI BỔ SUNG: QUẢN LÝ NỘI DUNG DỊCH VỤ & LỊCH HẸN
        { path: '/admin-services', label: 'Dịch vụ', icon: 'bi-gear-wide-connected' },
        { path: '/admin-maintenance', label: 'Lịch bảo trì', icon: 'bi-calendar-check' },
        
        { path: '/statistics', label: 'Thống kê', icon: 'bi-graph-up' },
        { path: '/AdminContact', label: 'Hỗ trợ', icon: 'bi-envelope' },
        { path: '/admin-chat', label: 'Chat trực tuyến', icon: 'bi-chat-dots' },
    ];

    const getNavLinkClass = (path) => {
        const baseClass = "nav-link px-2 transition-all position-relative ";
        const activeClass = "fw-bold text-primary border-bottom border-3 border-primary bg-light-primary rounded-top-3";
        return location.pathname === path 
            ? `${baseClass} ${activeClass}` 
            : `${baseClass} text-muted hover-primary`;
    };

    const handleLogout = () => {
        if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/locgin');
        }
    };

    return (
        <nav className="navbar navbar-expand-xl navbar-light sticky-top py-0 shadow-sm bg-white border-bottom">
            <div className="container-fluid px-4">
                
                {/* Logo thương hiệu */}
                <Link className="navbar-brand d-flex align-items-center me-4" to="/">
                    <div className="bg-primary rounded-3 p-1 me-2 shadow-sm">
                        <i className="bi bi-bicycle text-white fs-4 px-1"></i>
                    </div>
                    <span className="fw-800 fs-4 tracking-tight">
                        Tuấn Anh<span className="text-primary">Store</span>
                        <small className="d-block text-muted fw-normal" style={{fontSize: '10px', marginTop: '-5px'}}>Hệ thống Quản trị</small>
                    </span>
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAdmin">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNavAdmin">
                    {/* Menu chính - Căn giữa và giãn cách hợp lý */}
                    <ul className="navbar-nav mx-auto">
                        {menuItems.map((item) => (
                            <li className="nav-item mx-1" key={item.path}>
                                <Link className={getNavLinkClass(item.path)} to={item.path} style={{paddingBottom: '12px', paddingTop: '15px'}}>
                                    <i className={`bi ${item.icon} me-1`}></i>
                                    <span style={{fontSize: '0.9rem'}}>{item.label}</span>
                                    
                                    {/* Ví dụ: Hiển thị chấm đỏ nếu có đơn hàng/liên hệ mới (Logic demo) */}
                                    {(item.label === 'Đơn hàng' || item.label === 'Hỗ trợ') && (
                                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{marginTop: '15px', marginLeft: '-5px'}}></span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Khu vực User */}
                    <div className="d-flex align-items-center">
                        <div className="vr me-3 d-none d-xl-block" style={{height: '30px', opacity: 0.1}}></div>
                        
                        {!token ? (
                            <Link to="/locgin" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                                Đăng nhập
                            </Link>
                        ) : (
                            <div className="dropdown">
                                <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle text-dark p-1 pe-3 rounded-pill bg-light border" 
                                   id="dropdownUserAdmin" data-bs-toggle="dropdown">
                                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0d6efd&color=fff&bold=true`} 
                                         alt="avatar" width="32" height="32" className="rounded-circle me-2 shadow-sm" />
                                    <div className="d-none d-sm-block text-start">
                                        <div className="fw-bold small mb-0">{user.name}</div>
                                        <small className="text-success fw-bold" style={{fontSize: '10px'}}>Admin</small>
                                    </div>
                                </a>
                                
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-3 rounded-3 p-2">
                                    <li><Link className="dropdown-item py-2 rounded" to="/profile"><i className="bi bi-person me-2"></i>Hồ sơ</Link></li>
                                     <li><Link className="dropdown-item py-2 rounded-3" to="/shop-home">
                                        <i className="bi bi-speedometer2 me-2 text-primary"></i>trang chủ khách hàng
                                    </Link></li>
                                    <li><hr className="dropdown-divider opacity-25" /></li>
                                    <li>
                                        <button onClick={handleLogout} className="dropdown-item py-2 rounded text-danger fw-bold">
                                            <i className="bi bi-box-arrow-right me-2"></i> Thoát
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .hover-primary:hover { color: #0d6efd !important; background: rgba(13, 110, 253, 0.05); }
                .bg-light-primary { background: rgba(13, 110, 253, 0.03); }
                .fw-800 { font-weight: 800; }
                .tracking-tight { letter-spacing: -0.5px; }
            `}</style>
        </nav>
    );
};

export default Header;