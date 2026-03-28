import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // Nếu bạn vẫn bị lỗi 404 mà muốn vào làm giao diện, hãy sửa dòng dưới thành: return children;
    if (!token) {
        return <Navigate to="/locgin" replace />;
    }

    return children;
};

export default ProtectedRoute;