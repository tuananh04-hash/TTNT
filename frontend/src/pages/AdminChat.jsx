import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Kết nối Socket.io
const socket = io('http://localhost:3030');

const AdminChat = () => {
    const [conversations, setConversations] = useState([]); 
    const [selectedConv, setSelectedConv] = useState(null); 
    const [messages, setMessages] = useState([]);          
    const [reply, setReply] = useState("");                
    const scrollRef = useRef();

    // 1. Lấy danh sách hội thoại
    useEffect(() => {
        fetchConversations();
        
        socket.on('admin_receive_message', (data) => {
            fetchConversations(); 
            if (selectedConv && selectedConv.customer_email === data.email) {
                setMessages(prev => [...prev, { sender_type: 'customer', message_text: data.message }]);
            }
        });

        return () => socket.off('admin_receive_message');
    }, [selectedConv]);

    // 2. Tự động cuộn xuống
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('http://localhost:3030/api/v1/admin/conversations');
            setConversations(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const selectChat = async (conv) => {
        setSelectedConv(conv);
        socket.emit('join_conversation', conv.customer_email);
        try {
            const res = await axios.get(`http://localhost:3030/api/v1/chat/history/${conv.customer_email}`);
            setMessages(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const handleSendReply = async () => {
        if (!reply.trim() || !selectedConv) return;

        const replyData = {
            customer_email: selectedConv.customer_email,
            message: reply
        };

        socket.emit('admin_send_reply', replyData);

        try {
            await axios.post('http://localhost:3030/api/v1/admin/chat/reply', {
                conversation_id: selectedConv.id,
                message: reply
            });
            setMessages(prev => [...prev, { sender_type: 'admin', message_text: reply }]);
            setReply("");
            fetchConversations();
        } catch (err) { alert("Lỗi gửi tin nhắn"); }
    };

    return (
        <div className="admin-chat-wrapper container-fluid py-4" style={{ height: 'calc(100vh - 100px)' }}>
            <style>{`
                .admin-chat-wrapper { animation: fadeInUp 0.6s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .chat-card { height: 100%; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; overflow: hidden; }

                /* Cột trái */
                .conversation-list { background: #f8f9fa; border-right: 1px solid #eee; overflow-y: auto; }
                .conversation-item { 
                    padding: 18px; border-bottom: 1px solid #f0f0f0; cursor: pointer; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: white;
                }
                .conversation-item:hover { background: #f1f7ff; transform: translateX(5px); }
                .conversation-item.active { background: linear-gradient(45deg, #0d6efd, #0099ff); color: white; box-shadow: 0 4px 15px rgba(13, 110, 253, 0.2); }

                /* Bong bóng chat */
                .message-bubble { 
                    max-width: 70%; padding: 12px 18px; border-radius: 20px; font-size: 0.95rem; 
                    position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                }
                @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                
                .admin-msg { background: linear-gradient(135deg, #0d6efd, #0b5ed7); color: white; border-bottom-right-radius: 4px; }
                .customer-msg { background: white; color: #333; border-bottom-left-radius: 4px; border: 1px solid #eee; }

                /* Online Pulse */
                .online-indicator { width: 10px; height: 10px; background: #2ed573; border-radius: 50%; display: inline-block; margin-right: 6px; position: relative; animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(46, 213, 115, 0); } 100% { box-shadow: 0 0 0 0 rgba(46, 213, 115, 0); } }

                .chat-input-area { background: white; border-top: 1px solid #eee; padding: 20px; }
                .input-premium { border-radius: 50px; border: 2px solid #f0f0f0; padding: 12px 25px; transition: 0.3s; }
                .input-premium:focus { border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1); outline: none; }
                
                .btn-send { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .btn-send:hover { transform: rotate(-20deg) scale(1.1); }
            `}</style>

            <div className="row chat-card g-0">
                {/* DANH SÁCH BÊN TRÁI */}
                <div className="col-md-4 conversation-list">
                    <div className="p-4 bg-white sticky-top border-bottom">
                        <h4 className="fw-bold text-dark mb-0">Hỗ trợ khách hàng</h4>
                    </div>
                    {conversations.map((c) => (
                        <div 
                            key={c.id} 
                            onClick={() => selectChat(c)}
                            className={`conversation-item ${selectedConv?.id === c.id ? 'active' : ''}`}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-truncate" style={{maxWidth: '70%'}}>{c.customer_name || c.customer_email}</span>
                                <small className={selectedConv?.id === c.id ? 'text-white-50' : 'text-muted'}>
                                    {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                            </div>
                            <div className={`small text-truncate ${selectedConv?.id === c.id ? 'text-white-50' : 'text-muted'}`}>
                                {c.last_message || 'Bắt đầu chat...'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* KHUNG CHAT BÊN PHẢI */}
                <div className="col-md-8 d-flex flex-column bg-light">
                    {selectedConv ? (
                        <>
                            <div className="p-3 bg-white border-bottom d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px', fontWeight: 'bold' }}>
                                        {selectedConv.customer_email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0">{selectedConv.customer_email}</h6>
                                        <small className="text-success"><span className="online-indicator"></span>Trực tuyến</small>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow-1 p-4 overflow-auto" ref={scrollRef}>
                                {messages.map((m, i) => (
                                    <div key={i} className={`d-flex mb-4 ${m.sender_type === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`message-bubble ${m.sender_type === 'admin' ? 'admin-msg' : 'customer-msg'}`}>
                                            {m.message_text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="chat-input-area">
                                <div className="d-flex gap-2">
                                    <input 
                                        type="text" 
                                        className="form-control input-premium" 
                                        placeholder="Nhập tin nhắn phản hồi..." 
                                        value={reply} 
                                        onChange={(e) => setReply(e.target.value)} 
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} 
                                    />
                                    <button className="btn btn-primary btn-send" onClick={handleSendReply}>
                                        <i className="bi bi-send-fill"></i>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="m-auto text-center opacity-50">
                            <i className="bi bi-chat-dots display-1 d-block mb-3"></i>
                            <h5>Chọn một hội thoại để trả lời khách hàng</h5>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;