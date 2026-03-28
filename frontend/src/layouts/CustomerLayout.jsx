import { Outlet } from 'react-router-dom';
import HeaderClient from '../components/HeaderClient';

import FooterClient from '../components/FooterClient';

const CustomerLayout = () => {
    return (
        /* Thêm flex để Footer luôn ở dưới cùng nếu trang ít nội dung */
        <div className="customer-site-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            <HeaderClient /> 
            
            {/* main chiếm hết khoảng trống giữa */}
            <main className="container my-4" style={{ flex: '1' }}>
                <Outlet />
            </main>

            {/* Thẻ này phải khớp với tên đã import ở trên */}
            <FooterClient />
          
        </div>
    );
};

export default CustomerLayout;