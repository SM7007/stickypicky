# 🎨 stickypicky — Full-Stack Poster E-Commerce Website

A production-ready, premium, dark-themed poster-selling platform. This application is optimized for visual excellence, secure Razorpay payments, Cloudinary image hosting, and a robust admin dashboard.

---

## ⚡ Tech Stack

*   **Frontend:** React (Vite), React Router, Lucide Icons, React Hot Toast
*   **Styling:** Tailwind CSS (Modern Glassmorphic Dark Vibe)
*   **Backend:** Node.js, Express.js (REST API)
*   **Database:** PostgreSQL with Prisma ORM
*   **Authentication:** JWT with role-based access control (RBAC), bcryptjs
*   **Image Storage:** Cloudinary
*   **Payment Gateway:** Razorpay

---

## 📂 Project Structure

```
stickypicky/
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── components/   # Common, Product, Cart, Checkout, Admin components
│   │   ├── pages/        # Storefront pages (Home, Shop, Detail, Cart, Checkout)
│   │   ├── layouts/      # MainLayout & AdminLayout
│   │   ├── context/      # AuthContext & CartContext
│   │   └── services/     # Axios API configuration
│   └── index.html
│
└── backend/              # Node.js + Express Backend
    ├── prisma/           # Schema & seed script
    ├── src/
    │   ├── config/       # DB & Cloudinary configs
    │   ├── controllers/  # REST route controllers
    │   ├── routes/       # Express route handlers
    │   ├── middleware/   # JWT auth, upload, errors
    │   └── app.js
    └── .env.example
```

---

## 🚀 Setup & Installation

### 1. Requirements
*   **Node.js** (v16+ recommended)
*   **PostgreSQL** instance running locally or on a cloud provider (e.g. Supabase, Neon)

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both folders and fill in the values:

**Backend (`backend/.env`):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/stickypicky?schema=public"
JWT_SECRET="your_jwt_secret"
RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Initialize Database & Seed
Run these commands from the `backend/` directory:

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed default categories, admin user & 12 sample posters
npm run seed
```

**Default Admin Credentials:**
*   **Email:** `admin@stickypicky.com`
*   **Password:** `Admin@123`
*(Make sure to change these credentials in production).*

### 4. Start Development Servers

**Run Backend (from `backend/`):**
```bash
npm run dev
```

**Run Frontend (from `frontend/`):**
```bash
npm install
npm run dev
```

---

## 🛡️ Key Features & Flows

### 🛒 Real-time Pricing & Calculations
All totals, delivery charges (free above ₹500, else ₹49), and inventory reductions are calculated **strictly on the backend** during the payment validation phase. Frontend prices are never trusted.

### 💳 Razorpay Payment Flow
1.  Customer adds posters, chooses sizes (A4, A3, etc.) and proceeds to checkout.
2.  Backend calculates total in paise and registers a pending transaction order on Razorpay.
3.  Razorpay checkout opens. Upon success, client forwards transaction payload to backend.
4.  Backend verifies HMAC signature using key secret, creates order record, updates stock, and returns success confirmation.

### 🖼️ Cloudinary Image Upload
Admin can add new products via `/admin/products/add`. Uploaded poster files are handled by Multer-Cloudinary middleware, resizing and storing images dynamically.
