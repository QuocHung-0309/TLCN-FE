// Password validation function following backend passwordValidator.js
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ số");
  }
  if (!/[!@#$%^&*(),.?\":{}|<>_\-+=~`[\]\\;/]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
  }

  return errors;
};

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "Email là bắt buộc";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email không hợp lệ";
  }
  return null;
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `${fieldName} là bắt buộc`;
  }
  return null;
};