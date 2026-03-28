import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import các thư viện giao diện
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap cho layout
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap cho các hiệu ứng JS (nếu cần)
import './App.css'; // File CSS Ocean Ultra của bạn (để áp dụng toàn cục)

// Gắn React App vào thẻ #root trong index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);