import axios from 'axios';
import { useEffect, useState } from 'react';

const AdminContact = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [replyText, setReplyText] = useState(""); // Lưu nội dung đang soạn thảo

    useEffect(() => { fetchContacts(); }, []);

    const fetchContacts = async () => {
        try {
            const res = await axios.get('http://localhost:3030/api/v1/admin/contacts');
            setContacts(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const handleViewMessage = (item) => {
        setSelectedMsg(item);
        setReplyText(""); // Reset ô nhập khi mở tin nhắn mới
        if (item.status === 'new') updateStatus(item.id, 'read');
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.post('http://localhost:3030/api/v1/admin/contacts/update-status', { id, status });
            setContacts(contacts.map(c => c.id === id ? { ...c, status } : c));
        } catch (err) { console.error(err); }
    };

    // Hàm xử lý gửi phản hồi
    const handleSendReply = async () => {
        if (!replyText.trim()) return alert("Vui lòng nhập nội dung trả lời!");
        
        try {
            const res = await axios.post('http://localhost:3030/api/v1/admin/contacts/reply', {
                id: selectedMsg.id,
                replyMessage: replyText
            });
            if (res.data.errorCode === 0) {
                alert("✅ Đã gửi câu trả lời!");
                setSelectedMsg(null);
                fetchContacts();
            }
        } catch (err) { alert("Lỗi gửi phản hồi"); }
    };

    const deleteContact = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Xóa tin nhắn này?")) {
            await axios.post('http://localhost:3030/api/v1/admin/contacts/delete', { id });
            setContacts(contacts.filter(c => c.id !== id));
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white py-3 border-0">
                    <h4 className="fw-bold text-primary mb-0">📩 QUẢN LÝ LIÊN HỆ</h4>
                </div>
                <div className="card-body">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Khách hàng</th>
                                <th>Chủ đề</th>
                                <th>Trạng thái</th>
                                <th className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map(item => (
                                <tr key={item.id} onClick={() => handleViewMessage(item)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className={item.status === 'new' ? 'fw-bold' : ''}>{item.name}</div>
                                        <div className="small text-muted">{item.email}</div>
                                    </td>
                                    <td>{item.subject}</td>
                                    <td>
                                        {item.status === 'new' && <span className="badge bg-danger">Mới</span>}
                                        {item.status === 'read' && <span className="badge bg-warning text-dark">Đã xem</span>}
                                        {item.status === 'replied' && <span className="badge bg-success">Đã trả lời</span>}
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-danger px-3 rounded-pill" onClick={(e) => deleteContact(e, item.id)}>XÓA</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XEM CHI TIẾT & TRẢ LỜI */}
            {selectedMsg && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">📧 Chi tiết & Trả lời</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedMsg(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 border-end">
                                        <h6 className="fw-bold text-muted">TIN NHẮN KHÁCH HÀNG</h6>
                                        <p className="small mb-1"><strong>Từ:</strong> {selectedMsg.name}</p>
                                        <p className="small mb-3"><strong>Email:</strong> {selectedMsg.email}</p>
                                        <div className="p-3 bg-light rounded-3" style={{minHeight: '150px'}}>
                                            {selectedMsg.message}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-primary">VIẾT PHẢN HỒI</h6>
                                        <textarea 
                                            className="form-control mb-3" 
                                            rows="8" 
                                            placeholder="Nhập nội dung bạn muốn trả lời khách hàng..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        ></textarea>
                                        <button 
                                            className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm"
                                            onClick={handleSendReply}
                                        >
                                            <i className="bi bi-reply-fill me-2"></i> GỬI PHẢN HỒI
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContact;