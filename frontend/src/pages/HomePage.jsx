import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../app.css';
import { API_ENDPOINTS } from '../config/api';

const HomePage = () => {
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.STATISTICS);
                if (res.data.errorCode === 0) setStats(res.data.data);
            } catch (err) {
                console.error("Lỗi lấy thống kê", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const quickActions = [
        { to: "/create-user", label: "Người dùng mới", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", icon: "bi-person-plus", sub: "Thêm nhân sự" },
        { to: "/users", label: "Thành viên", color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", icon: "bi-people", sub: "Quản lý quyền" },
        { to: "/products", label: "Nhập hàng", color: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)", icon: "bi-bicycle", sub: "Thêm xe mới" },
        { to: "/shop", label: "Cửa hàng", color: "linear-gradient(135deg, #fcebb6 0%, #f07406 100%)", icon: "bi-shop", sub: "Xem giao diện" },
        { to: "/brands", label: "Nhãn hàng", color: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)", icon: "bi-tag", sub: "Brands" },
        { to: "/orders", label: "Vận chuyển", color: "linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)", icon: "bi-box", sub: "Xử lý đơn" },
    ];

    return (
        <div className="home-container py-5 bg-light min-vh-100">
            <div className="container">
                
                {/* Header Section */}
                <div className="row align-items-center mb-5">
                    <div className="col-md-8">
                        <h1 className="fw-800 display-5 mb-1 animate__animated animate__fadeInLeft"> chào mừng bạn <span className="text-primary text-gradient"> Đến với trang quản lý cửa hàng </span></h1>
                        <p className="text-muted lead">Chúc bạn có một ngày mới tốt lành .</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <div className="d-inline-flex bg-white p-2 rounded-4 shadow-sm border">
                            <input type="text" className="form-control border-0 bg-transparent" placeholder="Tìm kiếm nhanh..." />
                            <button className="btn btn-primary rounded-3 px-3"><i className="bi bi-search"></i></button>
                        </div>
                    </div>
                </div>

                {/* Statistics Row */}
                <div className="row g-4 mb-5">
                    <StatBox title="Doanh thu" value={`${Number(stats.totalRevenue).toLocaleString()}đ`} icon="bi-cash-stack" color="text-success" />
                    <StatBox title="Đơn hàng" value={stats.orders} icon="bi-cart-check" color="text-primary" />
                    <StatBox title="Sản phẩm" value={stats.products} icon="bi-bicycle" color="text-info" />
                    <StatBox title="Thành viên" value={stats.users} icon="bi-person-vcard" color="text-warning" />
                </div>

                <div className="row g-5">
                    {/* Main Features */}
                    <div className="col-lg-8">
                        <h4 className="fw-bold mb-4 d-flex align-items-center">
                            <i className="bi bi-grid-fill me-2 text-primary"></i> Quản lý hệ thống
                        </h4>
                        <div className="row g-4">
                            <FeatureCard icon="🚲" title="Kho Hàng" text="Tối ưu hóa số lượng xe trong kho và giá bán." link="/products" />
                            <FeatureCard icon="📊" title="Báo Cáo" text="Xem chi tiết biến động doanh số theo tháng." link="/statistics" />
                            <FeatureCard icon="🛡️" title="Bảo Mật" text="Thiết lập quyền truy cập cho nhân viên." link="/users" />
                        </div>

                        {/* Quick Actions Area */}
                        <div className="mt-5 p-4 rounded-4 bg-white shadow-sm">
                            <h5 className="fw-bold mb-4">Phím tắt thao tác</h5>
                            <div className="row g-3">
                                {quickActions.map((item, index) => (
                                    <div className="col-md-4" key={index}>
                                        <Link to={item.to} className="quick-action-new-card text-decoration-none">
                                            <div className="icon-circle shadow-sm" style={{ background: item.color }}>
                                                <i className={`bi ${item.icon} text-white`}></i>
                                            </div>
                                            <div className="ms-3">
                                                <div className="fw-bold text-dark">{item.label}</div>
                                                <small className="text-muted">{item.sub}</small>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                
                </div>

            </div>
        </div>
    );
};

// Sub-components
const StatBox = ({ title, value, icon, color }) => (
    <div className="col-md-3">
        <div className="stat-card p-4 rounded-4 shadow-sm bg-white border-bottom border-4">
            <div className={`fs-1 mb-2 ${color}`}><i className={`bi ${icon}`}></i></div>
            <div className="text-muted small fw-bold text-uppercase">{title}</div>
            <h3 className="fw-800 mb-0 mt-1">{value}</h3>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, text, link }) => (
    <div className="col-md-4">
        <Link to={link} className="text-decoration-none">
            <div className="feature-hover-card p-4 rounded-4 bg-white shadow-sm h-100 transition">
                <div className="fs-2 mb-3">{icon}</div>
                <h6 className="fw-bold text-dark">{title}</h6>
                <p className="text-muted extra-small mb-0">{text}</p>
            </div>
        </Link>
    </div>
);

export default HomePage;