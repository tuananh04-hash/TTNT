import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { API_ENDPOINTS } from '../config/api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Dùng useCallback để tránh render thừa
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_ENDPOINTS.USERS);
            if (response.data?.errorCode === 0) {
                setUsers(response.data.data);
            } else {
                setError('Không thể lấy danh sách người dùng');
            }
        } catch (err) {
            setError('Lỗi kết nối server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // 1. SỬA LỖI QUAN TRỌNG: Gọi đúng API_ENDPOINTS.UPDATE_ROLE
    const handleRoleChange = async (userId, newRole) => {
        try {
            // Đã sửa từ UPDATE_USER_ROLE thành UPDATE_ROLE cho khớp file config
            const res = await axios.post(API_ENDPOINTS.UPDATE_ROLE, { 
                userId, 
                role: newRole 
            });

            if (res.data?.errorCode === 0) {
                setToast({ message: `🚀 Đã nâng cấp thành công: ${newRole}`, type: 'success' });
                // Cập nhật state tại chỗ để UI thay đổi ngay lập tức
                setUsers(prevUsers => 
                    prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
                );
            } else {
                setToast({ message: res.data.message || 'Lỗi cập nhật', type: 'error' });
            }
        } catch (err) {
            console.error("Role Update Error:", err);
            setToast({ message: 'Lỗi kết nối API cập nhật quyền', type: 'error' });
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('❗ Bạn có chắc chắn muốn xóa thành viên này?')) return;
        setDeletingId(userId);
        try {
            const response = await axios.post(API_ENDPOINTS.DELETE_USER, { userId });
            if (response.data?.errorCode === 0) {
                setToast({ message: '✅ Đã xóa người dùng!', type: 'success' });
                setUsers(prev => prev.filter(u => u.id !== userId));
            }
        } catch (err) {
            setToast({ message: 'Lỗi khi xóa người dùng', type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    // 2. TĂNG TRẢI NGHIỆM: Tìm kiếm thông minh
    const filteredUsers = users.filter(user => {
        const s = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(s) || 
            user.email?.toLowerCase().includes(s) ||
            user.id.toString().includes(s)
        );
    });

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'Admin': return { backgroundColor: '#ef4444', color: '#fff' };
            case 'Staff': return { backgroundColor: '#f59e0b', color: '#fff' };
            default: return { backgroundColor: '#64748b', color: '#fff' };
        }
    };

    return (
        <main className="main-content py-5" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="container bg-white p-5 rounded-4 shadow-sm border-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
                    <div>
                        <h1 className="fw-bold text-dark m-0">👥 Quản trị viên</h1>
                        <p className="text-muted mb-0">Quản lý tài khoản và phân quyền hệ thống</p>
                    </div>
                    
                    <div className="d-flex gap-3 align-items-center w-100 w-md-auto">
                        <div className="position-relative flex-grow-1">
                            <input 
                                type="text" 
                                className="form-control rounded-pill ps-4 shadow-sm border-0" 
                                placeholder="Tìm theo tên, email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ height: '50px', backgroundColor: '#f8fafc', minWidth: '300px' }}
                            />
                        </div>

                        <Link to="/create-user" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
                            + Thêm mới
                        </Link>
                    </div>
                </div>

                {loading ? <Loading /> : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle border-0">
                            <thead>
                                <tr className="text-uppercase small fw-bold text-muted border-bottom">
                                    <th className="py-3">Mã ID</th>
                                    <th>Người dùng</th>
                                    <th>Địa chỉ</th>
                                    <th>Vai trò</th>
                                    <th className="text-end">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-bottom-0">
                                            <td className="text-muted fw-medium">#{user.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '40px', height: '40px' }}>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{user.name}</div>
                                                        <div className="small text-muted">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="text-dark">{user.city || 'Chưa cập nhật'}</span></td>
                                            <td>
                                                {/* Ô chọn Role to và rõ ràng */}
                                                <select 
                                                    className="form-select border-0 shadow-sm fw-bold"
                                                    style={{ 
                                                        width: '130px', 
                                                        borderRadius: '12px',
                                                        fontSize: '13px',
                                                        padding: '8px 12px',
                                                        ...getRoleBadgeStyle(user.role)
                                                    }}
                                                    value={user.role || 'User'}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="User" style={{color: '#000', backgroundColor: '#fff'}}>👤 USER</option>
                                                    <option value="Staff" style={{color: '#000', backgroundColor: '#fff'}}>🛠️ STAFF</option>
                                                    <option value="Admin" style={{color: '#000', backgroundColor: '#fff'}}>👑 ADMIN</option>
                                                </select>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link to={`/edit-user/${user.id}`} className="btn btn-light btn-sm rounded-circle p-2 shadow-sm" title="Chỉnh sửa">
                                                        ✏️
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={deletingId === user.id}
                                                        className="btn btn-light btn-sm rounded-circle p-2 shadow-sm text-danger"
                                                        title="Xóa tài khoản"
                                                    >
                                                        {deletingId === user.id ? '...' : '🗑️'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="text-muted">Không tìm thấy ai phù hợp với "{searchTerm}"</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
};

export default UserList;