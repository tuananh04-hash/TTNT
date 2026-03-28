const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeControllers'); 
const vnpayController = require('../controllers/vnpayController');

// Lấy các hàm xử lý từ Controller
const { 
    locgin, register, verifyOTP, forgotPassword, resetPassword,
    getHomePage, searchUsers, postCreateUser, geteditPage, postUpdateUser, 
    updateProfile, deleteUser, updateUserRole, getUserProfile,
    getProductPage, postCreateProduct, getEditProductPage, postUpdateProduct, deleteProduct,
    gethome, getProductsHome, getProductStore, getProductDetail, getProductsByBrand,
    getBrands, searchBrands, postCreateBrand, postUpdateBrand, deleteBrand,
    getOrders, updateOrderStatus, deleteOrder, handlePostCheckout, postCartCheckout, getMyOrdersByEmail,
    getProductReviews, postReview, checkCanReview,
    getServices, postBookMaintenance, updateServiceContent, deleteServiceContent,
    getMaintenanceRequests, updateMaintenanceStatus, getMyAppointments,
    getSuppliers, postCreateReceipt, getInventoryReceipts,
    postContact, getAdminContacts, updateContactStatus, deleteContact, replyContact,
    getAdminConversations, getChatHistory, postSendChat, postAdminReplyChat,
    getStatistics, getHomeData
} = homeController;

const { createPaymentUrl, vnpayReturn } = vnpayController;

// ================================================================
// I. AUTH & PROFILE (ƯU TIÊN CAO NHẤT)
// ================================================================
router.post('/locgin', locgin);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/update-profile', updateProfile); // Route tĩnh đặt TRƯỚC route động
router.get('/user/:id', getUserProfile);       // Route động đặt SAU

// ================================================================
// II. CLIENT SIDE - SHOP & PRODUCTS
// ================================================================
router.get('/home-client', getHomeData); 
router.get('/home-product', getProductsHome);
router.get('/product-store', getProductStore);
router.get('/product-detail/:id', getProductDetail); 
router.get('/products/brand/:brandId', getProductsByBrand);

// Đánh giá & Dịch vụ
router.get('/reviews/:id', getProductReviews);
router.post('/reviews/add', postReview);
router.get('/check-can-review', checkCanReview);
router.get('/services', getServices);
router.post('/book-maintenance', postBookMaintenance);
router.get('/my-maintenance/:email', getMyAppointments);

// ================================================================
// III. THANH TOÁN (VNPAY)
// ================================================================
router.post('/create-payment-vnpay', createPaymentUrl);
router.get('/vnpay-return', vnpayReturn); 

// ================================================================
// IV. ORDER & CHECKOUT
// ================================================================
router.post('/checkout', handlePostCheckout); 
router.post('/post-cart-checkout', postCartCheckout);
router.get('/my-orders/:email', getMyOrdersByEmail);

// ================================================================
// V. ADMIN CMS (QUẢN LÝ TỔNG HỢP)
// ================================================================

// Quản lý User & Role
router.get('/users', getHomePage);
router.get('/search-users', searchUsers);
router.post('/create-user', postCreateUser);
router.post('/update-user', postUpdateUser);
router.post('/delete-user', deleteUser);
router.post('/users/update-role', updateUserRole);

// Quản lý Sản phẩm & Thương hiệu
router.get('/admin/products', getProductPage); 
router.post('/create-product', postCreateProduct);
router.get('/product/:id', getEditProductPage); 
router.post('/update-product', postUpdateProduct);
router.post('/delete-product', deleteProduct);
router.get('/brands', getBrands);
router.get('/search-brands', searchBrands);
router.post('/create-brand', postCreateBrand);
router.post('/update-brand', postUpdateBrand);
router.post('/delete-brand', deleteBrand);

// Quản lý Đơn hàng & Thống kê
router.get('/orders', getOrders);
router.post('/admin/update-order-status', updateOrderStatus);
router.post('/delete-order', deleteOrder);
router.get('/statistics', getStatistics);

// Quản lý Kho (Inventory)
router.get('/suppliers', getSuppliers);
router.post('/inventory/create-receipt', postCreateReceipt);
router.get('/inventory/receipts', getInventoryReceipts);

// Quản lý Nội dung & Lịch hẹn
router.post('/admin/update-service-content', updateServiceContent);
router.post('/admin/delete-service-content', deleteServiceContent);
router.get('/admin/maintenance-requests', getMaintenanceRequests);
router.post('/admin/update-maintenance-status', updateMaintenanceStatus);

// Quản lý Liên hệ & Chat
router.post('/contact', postContact);
router.get('/admin/contacts', getAdminContacts);
router.post('/admin/contacts/update-status', updateContactStatus);
router.post('/admin/contacts/delete', deleteContact);
router.post('/admin/contacts/reply', replyContact);
router.get('/admin/conversations', getAdminConversations);
router.get('/chat/history/:email', getChatHistory);
router.post('/chat/send', postSendChat);
router.post('/admin/chat/reply', postAdminReplyChat);

module.exports = router;