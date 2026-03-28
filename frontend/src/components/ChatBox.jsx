import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3030');

const ChatBox = ({ customerEmail }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [file, setFile] = useState(null);

    const scrollRef = useRef();
    const fileInputRef = useRef();

    // JOIN + SOCKET
    useEffect(() => {
        if (customerEmail) {
            socket.emit('join_conversation', customerEmail);

            socket.on('new_message', (data) => {
                setMessages((prev) => [...prev, data]);

                if (!isOpen && data.sender_type === 'admin') {
                    setUnreadCount((prev) => prev + 1);
                }

                if (data.sender_type === 'admin') {
                    setIsTyping(false);
                }
            });

            socket.on('admin_typing', () => {
                if (isOpen) setIsTyping(true);
                setTimeout(() => setIsTyping(false), 2000);
            });
        }

        return () => {
            socket.off('new_message');
            socket.off('admin_typing');
        };
    }, [customerEmail, isOpen]);

    // SCROLL
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // LOAD HISTORY
    useEffect(() => {
        if (isOpen && customerEmail) {
            fetchMessages();
            setUnreadCount(0);
        }
    }, [isOpen, customerEmail]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`http://localhost:3030/api/v1/chat/history/${customerEmail}`);
            setMessages(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // SEND MESSAGE + FILE
    const handleSend = async () => {
        if ((!input.trim() && !file) || !customerEmail) return;

        let msgData = {
            email: customerEmail,
            message: input,
            sender_type: 'customer'
        };

        // upload file
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('email', customerEmail);
            formData.append('sender_type', 'customer');

            try {
                const res = await axios.post('http://localhost:3030/api/v1/chat/upload', formData);
                msgData.image = res.data.url;
            } catch (err) {
                console.error(err);
            }
        }

        socket.emit('customer_send_message', msgData);

        try {
            await axios.post(`http://localhost:3030/api/v1/chat/send`, msgData);
        } catch (err) {
            console.error(err);
        }

        // 🤖 simple bot
        if (input.toLowerCase().includes("giá")) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    sender_type: 'admin',
                    message: 'Dạ bên mình sẽ liên hệ báo giá chi tiết cho bạn nhé 😊'
                }]);
            }, 1000);
        }

        setInput("");
        setFile(null);
    };

    return (
        <div className={darkMode ? "dark" : ""} style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9999 }}>

            <style>{`
                .chat-bubble-btn {
                    width: 65px;
                    height: 65px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0066ff, #00c6ff);
                    border: none;
                    color: white;
                    cursor: pointer;
                    position: relative;
                }

                .badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: red;
                    color: white;
                    font-size: 12px;
                    padding: 4px 7px;
                    border-radius: 50%;
                }

                .chat-window {
                    width: 380px;
                    height: 550px;
                    background: #fff;
                    border-radius: 20px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                    position: absolute;
                    bottom: 85px;
                    right: 0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-header {
                    padding: 12px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    background: linear-gradient(90deg, #0066ff, #00c6ff);
                }

                .chat-body {
                    flex: 1;
                    padding: 10px;
                    overflow-y: auto;
                    background: #f5f7fb;
                }

                .message {
                    max-width: 75%;
                    padding: 10px;
                    border-radius: 15px;
                    margin-bottom: 8px;
                }

                .customer {
                    background: #0066ff;
                    color: white;
                    margin-left: auto;
                }

                .admin {
                    background: #eee;
                }

                .chat-input-container {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    border-top: 1px solid #eee;
                }

                .chat-input {
                    flex: 1;
                    border: none;
                    padding: 8px;
                    border-radius: 15px;
                    background: #f1f3f7;
                }

                .send-button {
                    margin-left: 5px;
                    background: #0066ff;
                    border: none;
                    color: white;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                }

                .typing {
                    font-size: 12px;
                    color: gray;
                }

                .dark .chat-window { background: #1e1e1e; }
                .dark .chat-body { background: #2a2a2a; }
                .dark .admin { background: #444; color: white; }
                .dark .chat-input { background: #333; color: white; }
            `}</style>

            {/* BUTTON */}
            <button className="chat-bubble-btn" onClick={() => setIsOpen(!isOpen)}>
                <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {/* CHAT */}
            {isOpen && (
                <div className="chat-window">

                    <div className="chat-header">
                        <span>💬 Hỗ trợ</span>
                        <i 
                            className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}
                            onClick={() => setDarkMode(!darkMode)}
                            style={{ cursor: 'pointer' }}
                        ></i>
                    </div>

                    <div className="chat-body" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.sender_type}`}>
                                {m.message_text || m.message}

                                {m.image && (
                                    <img src={m.image} style={{ width: '100%', borderRadius: '10px' }} />
                                )}
                            </div>
                        ))}

                        {isTyping && <div className="typing">Admin đang nhập...</div>}
                    </div>

                    {/* preview ảnh */}
                    {file && (
                        <div style={{ padding: '5px' }}>
                            <img src={URL.createObjectURL(file)} width="60" />
                        </div>
                    )}

                    <div className="chat-input-container">
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files[0])}
                        />

                        <button className="icon-btn" onClick={() => fileInputRef.current.click()}>
                            📷
                        </button>

                        <input
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập tin nhắn..."
                        />

                        <button className="send-button" onClick={handleSend}>
                            ➤
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ChatBox;