import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Import Pages (Admin)
import AdminChat from './pages/AdminChat';
import AdminContact from './pages/AdminContact';
import AdminMaintenance from './pages/AdminMaintenance';
import AdminServices from './pages/AdminServices';
import BrandManager from './pages/BrandManager';
import CreateUser from './pages/CreateUser';
import Statistics from './pages/Dashboard';
import EditProduct from './pages/EditProduct';
import EditUser from './pages/EditUser';
import HomePage from './pages/HomePage';
import InventoryManager from './pages/InventoryManager';
import OrderManager from './pages/OrderManager';
import ProductList from './pages/ProductList';
import UserList from './pages/UserList';

// Import Pages (Client)
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import HomeClient from './pages/HomeClient';
import MyOrders from './pages/MyOrders';
import ProductDetail from './pages/ProductDetail';
import ProductStore from './pages/ProductStore';
import Profile from './pages/Profile';
import Services from './pages/Services';
import ThankYou from './pages/ThankYou';
import Login from './pages/locgin';
import Register from './pages/register';
// MỚI: Trang xử lý kết quả VNPAY (Bạn cần tạo file này hoặc dùng ThankYou)
// import VNPayReturn from './pages/VNPayReturn'; 

// Import Layouts & Components
import ChatBox from './components/ChatBox';
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from './components/footer';
import Header from './components/heder';
import CustomerLayout from './layouts/CustomerLayout';

function App() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const customerEmail = user.email || ""; 

  return (
    <Router>
      <Routes>
        {/* ============================================================
            I. NHÓM TRANG KHÁCH HÀNG (Client)
            ============================================================ */}
        <Route element={
          <>
            <CustomerLayout />
            {customerEmail && <ChatBox customerEmail={customerEmail} />}
          </>
        }>
          <Route path="/shop-home" element={<HomeClient />} />
          <Route path="/store" element={<ProductStore />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* TRANG CẢM ƠN & KẾT QUẢ THANH TOÁN */}
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/vnpay-return" element={<ThankYou />} /> {/* Có thể dùng chung ThankYou để check tham số URL */}
          
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* II. CÁC TRANG CÔNG KHAI (Public) */}
        <Route path="/locgin" element={<Login />} />
        <Route path="/register" element={<Register />} />
       
        {/* III. NHÓM TRANG ADMIN */}
        <Route path="/" element={
          <ProtectedRoute>
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="main-content flex-grow-1"><HomePage /></main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {[
          { path: "/users", element: <UserList /> },
          { path: "/create-user", element: <CreateUser /> },
          { path: "/edit-user/:id", element: <EditUser /> },
          { path: "/products", element: <ProductList /> },
          { path: "/edit-product/:id", element: <EditProduct /> },
          { path: "/brands", element: <BrandManager /> },
          { path: "/orders", element: <OrderManager /> },
          { path: "/statistics", element: <Statistics /> },
          { path: "/inventory", element: <InventoryManager /> },
          { path: "/AdminContact", element: <AdminContact /> },
          { path: "/admin-chat", element: <AdminChat /> },
          { path: "/admin-services", element: <AdminServices /> },
          { path: "/admin-maintenance", element: <AdminMaintenance /> },
        ].map((route, index) => (
          <Route 
            key={index}
            path={route.path} 
            element={
              <ProtectedRoute>
                <div className="d-flex flex-column min-vh-100">
                  <Header />
                  <main className="main-content flex-grow-1">{route.element}</main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } 
          />
        ))}

        {/* IV. TRANG LỖI (404 Not Found) */}
        <Route path="*" element={
          <div className="text-center mt-5 py-5 border rounded bg-light mx-auto" style={{maxWidth: '500px'}}>
            <h1 className="display-1 fw-bold text-danger">404</h1>
            <h2 className="fw-bold">Rất tiếc!</h2>
            <p className="text-muted">Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
            <button className="btn btn-primary px-4 rounded-pill" onClick={() => window.location.href='/shop-home'}>
              Về trang chủ khách hàng
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;