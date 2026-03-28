import axios from 'axios';
import {
    ArcElement, CategoryScale, Chart as ChartJS, Filler,
    Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const Dashboard = () => {
    const [stats, setStats] = useState({ 
        users: 0, products: 0, orders: 0, 
        soldQuantity: 0, stockQuantity: 0, revenue: [0, 0, 0, 0, 0, 0] 
    });
    const [loading, setLoading] = useState(true);
    const dashboardRef = useRef();

    // 1. Tách hàm fetchStats ra để có thể tái sử dụng nhiều nơi
    const fetchStats = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Sử dụng URL từ cấu trúc API của bạn
            const res = await axios.get('http://localhost:3030/api/v1/statistics');
            if (res.data && res.data.errorCode === 0) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error("❌ Lỗi lấy thống kê từ Server:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Thiết lập đồng bộ hóa
    useEffect(() => {
        fetchStats(); // Chạy lần đầu khi load trang

        // Lắng nghe sự kiện 'orderUpdated' từ trang OrderManager
        const handleOrderUpdate = () => {
            console.log("🔔 Nhận tín hiệu cập nhật đơn hàng, đang làm mới Dashboard...");
            fetchStats(false); // Cập nhật ngầm (không hiện loading xoay xoay gây khó chịu)
        };

        window.addEventListener('orderUpdated', handleOrderUpdate);

        // Cleanup: Xóa lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('orderUpdated', handleOrderUpdate);
        };
    }, [fetchStats]);

    const getLast6MonthsLabels = () => {
        const labels = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(`Tháng ${d.getMonth() + 1}`);
        }
        return labels;
    };

    const exportPDF = async () => {
        const element = dashboardRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save("Bao-Cao-Thong-Ke.pdf");
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
        </div>
    );

    const sold = Number(stats.soldQuantity || 0);
    const stock = Number(stats.stockQuantity || 0);
    const totalInventory = sold + stock;
    const saleRate = totalInventory > 0 ? Math.round((sold / totalInventory) * 100) : 0;

    return (
        <div className="dashboard-container p-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Hệ Thống Quản Trị</h2>
                    <p className="text-muted small">Dữ liệu tự động cập nhật khi trạng thái đơn hàng thay đổi</p>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => fetchStats(true)} className="btn btn-outline-primary rounded-3 shadow-sm">
                        <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                    </button>
                    <button onClick={exportPDF} className="btn btn-dark px-4 py-2 rounded-3 shadow-sm d-flex align-items-center">
                        <i className="bi bi-file-earmark-pdf-fill me-2 text-danger"></i> Xuất PDF
                    </button>
                </div>
            </div>

            <div ref={dashboardRef} className="p-1">
                {/* 4 Cards chính */}
                <div className="row g-4 mb-4">
                    <StatCard title="NGƯỜI DÙNG" value={stats.users} icon="bi-people" color="#4e73df" />
                    <StatCard title="ĐƠN HÀNG" value={stats.orders} icon="bi-receipt" color="#1cc88a" />
                    <StatCard title="SẢN PHẨM ĐÃ BÁN" value={sold} icon="bi-cart-check" color="#36b9cc" />
                    <StatCard title="TỔNG TỒN KHO" value={stock} icon="bi-box-seam" color="#f6c23e" />
                </div>

                <div className="row g-4">
                    {/* Line Chart */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                            <h6 className="fw-bold text-muted mb-4 text-uppercase">Doanh thu 6 tháng gần nhất</h6>
                            <div style={{ height: '350px' }}>
                                <Line 
                                    data={{
                                        labels: getLast6MonthsLabels(),
                                        datasets: [{
                                            label: 'Doanh thu (VNĐ)',
                                            data: stats.revenue || [0, 0, 0, 0, 0, 0],
                                            borderColor: '#4e73df',
                                            backgroundColor: 'rgba(78, 115, 223, 0.1)',
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 5,
                                            pointBackgroundColor: '#4e73df'
                                        }]
                                    }}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { 
                                                beginAtZero: true, 
                                                ticks: { callback: (val) => val.toLocaleString() + 'đ' }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Doughnut Chart */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 text-center">
                            <h6 className="fw-bold text-muted mb-4 text-start text-uppercase">Tỉ lệ tiêu thụ hàng hóa</h6>
                            <div className="position-relative mx-auto mb-4" style={{ height: '230px', width: '230px' }}>
                                <Doughnut 
                                    data={{
                                        labels: ['Đã bán', 'Tồn kho'],
                                        datasets: [{
                                            data: [sold, stock],
                                            backgroundColor: ['#36b9cc', '#eaecf4'],
                                            borderWidth: 0,
                                            cutout: '80%'
                                        }]
                                    }}
                                    options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                />
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <h2 className="fw-bold mb-0">{saleRate}%</h2>
                                    <p className="small text-muted mb-0">Đã bán</p>
                                </div>
                            </div>
                            <div className="d-flex justify-content-around mt-auto border-top pt-3">
                                <div>
                                    <div className="small text-muted">Bán ra</div>
                                    <div className="fw-bold">{sold}</div>
                                </div>
                                <div className="border-start ps-3">
                                    <div className="small text-muted">Còn lại</div>
                                    <div className="fw-bold">{stock}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
                    transition: transform 0.2s ease;
                }
                .stat-card:hover { transform: translateY(-5px); }
                .icon-box { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="col-xl-3 col-md-6">
        <div className="stat-card h-100 border-start border-5" style={{ borderLeftColor: color }}>
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <div className="small fw-bold text-uppercase mb-1" style={{ color: color }}>{title}</div>
                    <h4 className="fw-bold mb-0 text-dark">{(value || 0).toLocaleString()}</h4>
                </div>
                <div className="icon-box" style={{ backgroundColor: `${color}15`, color: color }}>
                    <i className={`bi ${icon} fs-4`}></i>
                </div>
            </div>
        </div>
    </div>
);

export default Dashboard;