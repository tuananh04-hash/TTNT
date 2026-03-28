// Form validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUser = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Họ tên không được để trống';
  } else if (data.name.length < 3) {
    errors.name = 'Họ tên phải có ít nhất 3 ký tự';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email không được để trống';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.city = 'Thành phố không được để trống';
  }

  return errors;
};

export const validateProduct = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Tên sản phẩm không được để trống';
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.category = 'Loại xe không được để trống';
  }

  if (!data.price || parseFloat(data.price) <= 0) {
    errors.price = 'Giá bán phải lớn hơn 0';
  }

  if (!data.stock || parseInt(data.stock) < 0) {
    errors.stock = 'Số lượng kho không được âm';
  }

  return errors;
};
