## 🔍 Token & User Info Debug Guide

### **Cách kiểm tra token và user info loading:**

#### 1. **Mở Developer Tools (F12)**
   - Đi tới tab **Console**
   - Xoá console history (tùy chọn)

#### 2. **Các Debug Points:**

**Khi vào trang Home (Header mount):**
```
🔐 [Header.useEffect[mount]] Token Status:
  - accessToken: { exists: true, preview: "...", length: 200+ }
  - zustandStore: { hasToken: true, tokenPreview: "..." }

🔄 [Header.useEffect[accessToken]] Auth State Changed:
  - isLoggedIn: true
  - accessToken: "eyJhbGc..."

👤 [Header.loadProfile[success]] User Profile Loaded:
  - fullName: "Nguyễn Văn A"
  - email: "user@example.com"
  - phone: "0912345678"
  - points: 150

📱 [Header.loadProfile[display]] User Info Display:
  - fullName: "Nguyễn Văn A"
  - email: "user@example.com"
```

**Khi đăng nhập (Login):**
```
🔄 [Login.onSuccess] Auth State Changed:
  - accessToken: "eyJhbGc..." (new token)
  - refreshToken: "..."

📱 [Login.extractUserId] User Info Display:
  - id: "user123"
```

**Khi vào trang Checkout:**
```
🔐 [Checkout.loadUserProfile[start]] Token Status:
  - accessToken: { exists: true, preview: "..." }

👤 [Checkout.loadUserProfile[success]] User Profile Loaded:
  - fullName: "Nguyễn Văn A"
  - email: "user@example.com"
  - phone: "0912345678"

🛒 [Checkout.loadUserProfile[preFill]] Checkout Pre-fill:
  - fullName: "Nguyễn Văn A"
  - email: "user@example.com"
  - phone: "0912345678"
  - isReadOnly: true
```

#### 3. **Các vấn đề có thể gặp:**

**❌ Nếu không thấy token:**
```
🔐 [Header.useEffect[mount]] Token Status:
  - accessToken: { exists: false, preview: "null" }
  - zustandStore: { hasToken: false }
```
**→ Kiểm tra:**
- Có đăng nhập chưa?
- localStorage có "auth" key?
- localStorage có "accessToken" key?

**❌ Nếu token tồn tại nhưng không fetch được profile:**
```
👤 [Header.loadProfile[error]] User Profile Loaded:
  - error: "401 Unauthorized"
  - status: 401
```
**→ Kiểm tra:**
- Token có hợp lệ?
- API endpoint `/auth/me` có hoạt động?
- CORS có cấu hình đúng?

**❌ Nếu checkout không pre-fill:**
```
🔐 [Checkout.loadUserProfile[noToken]] Token Status:
```
**→ Kiểm tra:**
- User có đăng nhập?
- Token có được lưu trong store?

#### 4. **Kiểm tra localStorage trực tiếp:**

Trong console, chạy:
```javascript
// Xem tất cả auth data
console.log('Auth Store:', JSON.parse(localStorage.getItem('auth')));
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Decode JWT (nếu cần)
const token = localStorage.getItem('accessToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', decoded);
```

#### 5. **Kiểm tra Network Requests:**

- Đi tới tab **Network**
- Filter requests bằng "auth" hoặc "profile"
- Xem request/response của `/auth/me`
- Kiểm tra Authorization header: `Bearer {token}`

---

### **Summary - Nên thấy những logs này:**

✅ **Khi Login thành công:** 2-3 logs từ Login page
✅ **Khi vào Home:** 4-5 logs từ Header  
✅ **Khi vào Checkout:** 3-4 logs từ Checkout page
✅ **Khi Logout:** clearAllTokens được gọi

**Nếu logs không xuất hiện → có vấn đề cần debug!**
