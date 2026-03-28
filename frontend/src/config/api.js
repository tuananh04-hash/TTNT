// 1. Cấu hình URL gốc
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030';
const API_PREFIX = '/api/v1';
const API_URL = `${API_BASE_URL}${API_PREFIX}`;

export const API_ENDPOINTS = {
    // ==========================================
    // I. AUTHENTICATION (Xác thực người dùng)
    // ==========================================
    LOCGIN: `${API_URL}/locgin`, 
    REGISTER: `${API_URL}/register`,
    VERIFY_OTP: `${API_URL}/verify-otp`,
    FORGOT_PASSWORD: `${API_URL}/forgot-password`,
    RESET_PASSWORD: `${API_URL}/reset-password`,

    // ==========================================
    // II. CLIENT SIDE (Dành cho khách hàng)
    // ==========================================
    HOME_CLIENT: `${API_URL}/home-client`,
    HOME_PRODUCT_LIST: `${API_URL}/home-product`,
    PRODUCT_DETAIL: (id) => `${API_URL}/product-detail/${id}`,
    BRANDS_LIST: `${API_URL}/brands`,
    PRODUCTS_BY_BRAND: (brandId) => `${API_URL}/products/brand/${brandId}`,
    POST_CART_CHECKOUT: `${API_URL}/post-cart-checkout`, 
    CONTACT: `${API_URL}/contact`, 
    MY_ORDERS: (email) => `${API_URL}/my-orders/${email}`,
    GET_MY_MAINTENANCE: (email) => `${API_URL}/my-maintenance/${email}`,

    // ==========================================
    // III. USER PROFILE & SETTINGS
    // ==========================================
    USER_PROFILE: (id) => `${API_URL}/user/${id}`,
    UPDATE_PROFILE: `${API_URL}/update-profile`, 

    // ==========================================
    // IV. ADMIN: QUẢN LÝ NGƯỜI DÙNG (USERS)
    // ==========================================
    USERS: `${API_URL}/users`,
    CREATE_USER: `${API_URL}/create-user`,
    UPDATE_USER: `${API_URL}/update-user`,
    DELETE_USER: `${API_URL}/delete-user`,
    SEARCH_USERS: `${API_URL}/search-users`,
    UPDATE_ROLE: `${API_URL}/users/update-role`,
    
    // ==========================================
    // V. ADMIN: QUẢN LÝ SẢN PHẨM (PRODUCTS)
    // ==========================================
    ADMIN_PRODUCTS: `${API_URL}/admin/products`,
    PRODUCT_DETAIL_ADMIN: (id) => `${API_URL}/product/${id}`,
    CREATE_PRODUCT: `${API_URL}/create-product`,
    UPDATE_PRODUCT: `${API_URL}/update-product`,
    DELETE_PRODUCT: `${API_URL}/delete-product`,

    // ==========================================
    // VI. ADMIN: QUẢN LÝ THƯƠNG HIỆU (BRANDS)
    // ==========================================
    BRANDS: `${API_URL}/brands`,
    SEARCH_BRANDS: `${API_URL}/search-brands`,
    CREATE_BRAND: `${API_URL}/create-brand`,
    UPDATE_BRAND: `${API_URL}/update-brand`,
    DELETE_BRAND: `${API_URL}/delete-brand`,

    // ==========================================
    // VII. ADMIN: QUẢN LÝ ĐƠN HÀNG (ORDERS)
    // ==========================================
    ORDERS: `${API_URL}/orders`, 
    UPDATE_ORDER_STATUS: `${API_URL}/admin/update-order-status`,
    DELETE_ORDER: `${API_URL}/delete-order`,
    
    // ==========================================
    // VIII. QUẢN LÝ KHO (INVENTORY)
    // ==========================================
    INVENTORY_STOCK: `${API_URL}/inventory/stock`,
    INVENTORY_RECEIPTS: `${API_URL}/inventory/receipts`,
    CREATE_RECEIPT: `${API_URL}/inventory/create-receipt`,
    SUPPLIERS: `${API_URL}/suppliers`,
    CREATE_SUPPLIER: `${API_URL}/create-supplier`,

    // ==========================================
    // IX. CHAT & CONTACT ADMIN
    // ==========================================
    ADMIN_CONTACTS: `${API_URL}/admin/contacts`,
    UPDATE_CONTACT: `${API_URL}/admin/contacts/update-status`,
    DELETE_CONTACT: `${API_URL}/admin/contacts/delete`,
    ADMIN_CONVERSATIONS: `${API_URL}/admin/conversations`,
    CHAT_HISTORY: (email) => `${API_URL}/chat/history/${email}`,
    CHAT_SEND: `${API_URL}/chat/send`,
    ADMIN_CHAT_REPLY: `${API_URL}/admin/chat/reply`,

    // ==========================================
    // X. THỐNG KÊ (STATISTICS)
    // ==========================================
    STATISTICS: `${API_URL}/statistics`,

    // ==========================================
    // XI. ĐÁNH GIÁ SẢN PHẨM (REVIEWS)
    // ==========================================
    GET_REVIEWS: (id) => `${API_URL}/reviews/${id}`, 
    POST_REVIEW: `${API_URL}/reviews/add`,

    // ==========================================
    // XII. DỊCH VỤ & BẢO DƯỠNG (SERVICES & MAINTENANCE)
    // ==========================================
    GET_SERVICES_INFO: `${API_URL}/services`,
    BOOK_MAINTENANCE: `${API_URL}/book-maintenance`,
    ADMIN_UPDATE_SERVICE_CONTENT: `${API_URL}/admin/update-service-content`,
    ADMIN_DELETE_SERVICE_CONTENT: (key) => `${API_URL}/admin/delete-service-content/${key}`,
    ADMIN_MAINTENANCE_REQUESTS: `${API_URL}/admin/maintenance-requests`,
    UPDATE_MAINTENANCE_STATUS: `${API_URL}/admin/update-maintenance-status`,

    // ==========================================
    // XIII. THANH TOÁN (VNPAY) - MỚI CẬP NHẬT
    // ==========================================
    CREATE_PAYMENT_VNPAY: `${API_URL}/create-payment-vnpay`,
    VNPAY_RETURN: `${API_URL}/vnpay-return`, 
};

export default API_URL;