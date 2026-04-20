# 🚀 Porjaikai v7 - The Modern Hearth (Stitch Design)

## ✅ สิ่งที่เอามารอบนี้

### 📱 Frontend (index.html & admin.html)
ทั้งหมด **4 หน้าจอ** ที่ออกแบบตามดีไซน์ Stitch "The Modern Hearth":

#### **index.html** มี 3 tabs:
1. **📊 วันนี้** (Today's Orders)
   - ✨ Featured dish hero section
   - 📊 Live count badges (ออเดอร์ในชั่วโมงนี้)
   - 🔥 Trending products (ขายดีสุด)
   - 📱 Recent orders activity (เพื่อนๆ กำลังสั่ง)

2. **🛒 สั่งของ** (Order Food)
   - 📱 Pending payment banner (ยังค้างการชำระเงิน)
   - 📦 Menu grid with stock status
   - 🚚 Delivery method visual toggle (ส่งที่โต๊ะ / มารับเอง)
   - 💰 Payment method visual toggle (โอนเงิน / เงินสด)
   - 📸 Conditional receipt upload (แสดงเฉพาะเลือกโอนเงิน)
   - 🖼️ Image compression (บีบรูปอัตโนมัติ)

3. **⚙️ จัดการ** (Admin Dashboard - หากเข้าระบบแล้ว)
   - 📈 Monthly sales chart
   - 💰 Financial summary (4-column grid)
   - 🚚 Delivery checklist
   - 📊 Stock management

#### **admin.html** มี 2 views:
1. **📊 แดชบอร์ด** (Dashboard)
   - 📈 Monthly sales trend chart
   - 💰 Financial KPIs (4 cards)
   - 🛠️ Product CRUD management
   - ⚡ Quick walk-in sales buttons

2. **🚚 ครัว** (Kitchen View)
   - 🚚 Order checklist with table numbers (T01, T02, etc.)
   - 🔄 Delivery toggle (รอส่ง ↔️ ส่งแล้ว)
   - 📊 Real-time inventory counter

### 🎨 Design System (Stitch)
- **Color Palette**: Orange (#f97f06), Green (#176a21), Blue (#005caa)
- **Typography**: Plus Jakarta Sans (300-800 weights)
- **No Borders**: ใช้ color layers แทนเส้นขอบ
- **Glassmorphism**: Frosted glass effect บน navigation
- **Bento Layouts**: Grid layouts สำหรับ KPIs
- **Status Badges**: Success/Pending/Warning icons

### 🔐 Authentication
- Admin password: **12399**
- Applies to: getAdminData, updateStatus, manageProduct, createOrder (walk-in)

### 🔧 Backend (CodeGSforCOPY.gs)
✅ Complete All-in-One System:
- `getDashboard` - Load products & order status
- `getAdminData` - Load admin dashboard data with monthly stats
- `createOrder` - Create new order
- `updateStatus` - Update delivery/payment status
- `manageProduct` - CRUD operations (create/update/delete)
- `checkAdminAuth` - Verify password

---

## 📋 How to Test

### 1️⃣ **Customer Flow** (index.html)
Open: `https://your-github-pages.com/index.html`

**Test Case 1**: Browse Today's Orders
- See featured dish, live count, trending products
- See recent order activity

**Test Case 2**: Place Order
- Click "🛒 สั่งของ" tab
- Select items (try quantity +/-)
- Choose delivery method (visual toggle)
- Choose payment method (visual toggle)
- If "โอนเงิน" → see slip upload
- If "เงินสด" → slip upload hidden
- Click "สั่งแล้ว 🚀"
- Check "📊 วันนี้" to see order in activity

### 2️⃣ **Admin Flow** (admin.html)
Open: `https://your-github-pages.com/admin.html`

**Test Case 1**: Admin Authentication
- Password: `12399`
- Should see "📊 แดชบอร์ด" and "🚚 ครัว" tabs

**Test Case 2**: Dashboard
- View monthly chart
- View financial KPIs
- Create/Edit/Delete products
- Quick walk-in sales

**Test Case 3**: Kitchen View
- See order checklist with table numbers (T01, T02, etc.)
- Click "📦 เช็กส่งของ" to mark delivered
- Update inventory inline

**Test Case 4**: Real-time Sync
- Click "🔄 รีเฟรช" to reload

---

## 🔗 GAS Script Deployment

หลังจาก clasp login สำเร็จ:
```bash
clasp push
clasp deploy
```

Copy deployment URL ใส่ `const GAS_URL = "..."` ในทั้ง index.html และ admin.html

---

## 📁 Files Changed

| File | Status | Changes |
|------|--------|---------|
| `index.html` | ✅ New | Complete redesign with Stitch (3 tabs) |
| `admin.html` | ✅ New | Complete redesign with Stitch (2 views) |
| `CodeGSforCOPY.gs` | ✅ Updated | Enhanced for admin, fixed auth |
| `index_old.html` | 📦 Backup | Original version |
| `admin_old.html` | 📦 Backup | Original version |

---

## ⚠️ Known Issues / To Fix Later

1. **Image Upload**: Currently no server storage (hardcoded as empty)
   - Fix: Upload to Google Drive using Apps Script

2. **Real-time Updates**: Using polling every 30s (not WebSocket)
   - Fix: Could upgrade to Firebase Realtime DB for instant updates

3. **Mobile Responsive**: Need testing on various screen sizes
   - Fix: Adjust grid breakpoints as needed

4. **LINE LIFF Integration**: Currently using fallback
   - Fix: Configure LINE LIFF ID

---

## 🎯 Quick Tweaks

### Change Admin Password
In `CodeGSforCOPY.gs`:
```javascript
const ADMIN_PASSWORD = 'YOUR_NEW_PASSWORD';
```

### Change GAS URL
In `index.html` & `admin.html`:
```javascript
const GAS_URL = "YOUR_DEPLOYMENT_URL";
```

### Change Colors
In `style` sections:
```css
.primary-orange { color: #NEW_COLOR; }
```

---

## 📝 Next Steps

1. Test all flows (customer & admin)
2. Deploy GAS script with clasp
3. Update GAS_URL in HTML files
4. Test payment flow (upload slip)
5. Configure LINE LIFF (optional)
6. Set up image storage on Drive
7. Monitor performance & fix issues

Ready to go! 🚀
