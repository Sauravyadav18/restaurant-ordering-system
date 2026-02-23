# 🍽️ Restaurant Menu & Ordering System — Complete Project Documentation

> **Tech Stack:** React · Node.js · Express · MongoDB · Socket.io · JWT  
> **Author:** Saurav Yadav  
> **Purpose:** A beginner-friendly, professional knowledge transfer guide

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Architecture](#2-project-architecture)
3. [Backend Deep Explanation](#3-backend-deep-explanation)
4. [Database Explanation (MongoDB)](#4-database-explanation-mongodb)
5. [Frontend Deep Explanation](#5-frontend-deep-explanation)
6. [Real-Time Communication (Socket.io)](#6-real-time-communication-socketio)
7. [Authentication & Security](#7-authentication--security)
8. [Deployment Explanation](#8-deployment-explanation)
9. [Step-by-Step Execution Flow](#9-step-by-step-execution-flow)
10. [Common Bugs & Debugging Guide](#10-common-bugs--debugging-guide)
11. [Learning Section](#11-learning-section)

---

# 1. Project Overview

## What This Project Does

This is a **full-stack restaurant ordering system** where:

- **Customers** browse a menu, add items to cart, select a table (or parcel), and place orders
- **Admin (Restaurant Owner)** manages the menu, views orders in real-time, updates order status, manages tables, and handles payments
- Everything happens in **real-time** — when a customer places an order, the admin sees it instantly (no page refresh needed)

## Features Implemented

| Feature | Description |
|---|---|
| **Dynamic Menu** | Menu items with categories, prices, images, availability toggle |
| **Shopping Cart** | Add/remove items, persistent across page refreshes |
| **Order Types** | Dine-In (with table selection) or Parcel |
| **Table Management** | Lock tables on order, unlock on payment/cancellation |
| **Real-Time Updates** | Socket.io for instant order notifications |
| **Admin Dashboard** | CRUD menu items, manage categories |
| **Order Management** | Status flow: Pending → Preparing → Served → Paid |
| **Order Cancellation** | Admin can cancel unpaid orders |
| **Payment Tracking** | Mark orders as paid, auto-close and free table |
| **Dynamic Categories** | Admin can add/delete categories dynamically |
| **Password Management** | Change password + Forgot password via email OTP |
| **JWT Authentication** | Secure admin routes with token-based auth |
| **Order Persistence** | Customer can close browser and return to see their order |

## Order Lifecycle

```
┌──────────┐    ┌───────────┐    ┌────────┐    ┌──────┐    ┌────────┐
│ Customer │───▶│  Pending  │───▶│Preparing│───▶│Served│───▶│  Paid  │
│  Places  │    │  (New)    │    │ (Admin) │    │(Admin)│   │(Closed)│
│  Order   │    └───────────┘    └────────┘    └──────┘    └────────┘
└──────────┘          │                                         │
                      │         ┌───────────┐                   │
                      └────────▶│ Cancelled │                   │
                                │  (Admin)  │                   │
                                └───────────┘                   │
                                                                ▼
                                                          Table Freed
```

## Admin vs Customer Flow

```
┌─────────────────────────────────────────────────────────┐
│                     CUSTOMER FLOW                       │
│                                                         │
│  Browse Menu ──▶ Add to Cart ──▶ Enter Details ──▶     │
│  Select Table ──▶ Place Order ──▶ Track Status          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      ADMIN FLOW                         │
│                                                         │
│  Login ──▶ Manage Menu ──▶ View Orders ──▶             │
│  Update Status ──▶ Receive Payment ──▶ Manage Tables   │
└─────────────────────────────────────────────────────────┘
```

---

# 2. Project Architecture

## Folder Structure

```
restaurant-ordering-system/
├── backend/                        ← Node.js API Server
│   ├── config/
│   │   └── db.js                   ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       ← Login, password reset, OTP
│   │   ├── categoryController.js   ← CRUD categories
│   │   ├── menuController.js       ← CRUD menu items
│   │   ├── orderController.js      ← Create, update, cancel orders
│   │   └── tableController.js      ← Table management
│   ├── middleware/
│   │   ├── authMiddleware.js       ← JWT verification + role check
│   │   └── errorHandler.js         ← Global error handling
│   ├── models/
│   │   ├── Category.js             ← Category schema
│   │   ├── Menu.js                 ← Menu item schema
│   │   ├── Order.js                ← Order schema (with items)
│   │   ├── Table.js                ← Table schema
│   │   └── User.js                 ← Admin user schema
│   ├── routes/
│   │   ├── authRoutes.js           ← /api/auth/*
│   │   ├── categoryRoutes.js       ← /api/categories/*
│   │   ├── menuRoutes.js           ← /api/menu/*
│   │   ├── orderRoutes.js          ← /api/orders/*
│   │   └── tableRoutes.js          ← /api/tables/*
│   ├── socket/
│   │   └── socketHandler.js        ← WebSocket event handling
│   ├── utils/
│   │   └── emailService.js         ← OTP email (Brevo + Gmail)
│   ├── server.js                   ← App entry point
│   ├── seed.js                     ← Seed menu items
│   └── seedCategories.js           ← Seed default categories
│
├── frontend/                       ← React (Vite) App
│   └── src/
│       ├── components/
│       │   ├── CartItem.jsx        ← Single cart item row
│       │   ├── FloatingCart.jsx    ← Bottom-right cart bubble
│       │   ├── MenuCard.jsx        ← Menu item card
│       │   ├── Navbar.jsx          ← Top navigation bar
│       │   └── OrderCard.jsx       ← Order display card (admin)
│       ├── context/
│       │   ├── AuthContext.jsx     ← Auth state (login/logout)
│       │   └── CartContext.jsx     ← Cart state (items/total)
│       ├── pages/
│       │   ├── Home.jsx            ← Menu browsing page
│       │   ├── Cart.jsx            ← Cart + place order
│       │   ├── OrderSuccess.jsx    ← Order tracking page
│       │   ├── AdminLogin.jsx      ← Admin login form
│       │   ├── AdminDashboard.jsx  ← Menu CRUD + categories
│       │   ├── AdminOrders.jsx     ← Order management
│       │   ├── AdminTables.jsx     ← Table management
│       │   └── ChangePassword.jsx  ← Password change/reset
│       ├── services/
│       │   ├── api.js              ← Axios API client
│       │   └── socket.js           ← Socket.io client
│       ├── App.jsx                 ← Root component + routing
│       └── main.jsx                ← React entry point
```

## How Frontend and Backend Connect

```
┌───────────────────┐         HTTP (REST API)          ┌──────────────────┐
│                   │  ─────────────────────────────▶   │                  │
│   React Frontend  │         /api/menu                │  Node.js Backend │
│   (Port 5173)     │         /api/orders              │  (Port 5000)     │
│                   │         /api/auth                 │                  │
│                   │  ◀─────────────────────────────   │                  │
│                   │                                   │                  │
│                   │      WebSocket (Socket.io)        │                  │
│                   │  ◀════════════════════════════▶   │                  │
│                   │    Real-time: order updates       │                  │
└───────────────────┘                                   └──────┬───────────┘
                                                               │
                                                               │
                                                        ┌──────▼───────┐
                                                        │   MongoDB    │
                                                        │  (Database)  │
                                                        └──────────────┘
```

**WHY separate?**
- Frontend and backend run independently — you can deploy them on different servers
- This is how **real-world apps** work (Netflix frontend ≠ Netflix backend)
- You can build a mobile app later that talks to the same backend

---

# 3. Backend Deep Explanation

## 3.1 server.js — The Entry Point

`server.js` is the first file that runs. It sets up everything:

```javascript
require('dotenv').config();           // Load .env variables
const express = require('express');    // Web framework
const cors = require('cors');          // Allow cross-origin requests
const http = require('http');          // Built-in HTTP module
const { Server } = require('socket.io');  // Real-time engine

const app = express();                 // Create Express app

// CORS — allow frontend to talk to backend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Register API routes
app.use('/api/auth', authRoutes);       // Authentication
app.use('/api/menu', menuRoutes);       // Menu CRUD
app.use('/api/orders', orderRoutes);    // Order management
app.use('/api/tables', tableRoutes);    // Table management
app.use('/api/categories', categoryRoutes); // Category management

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible inside controllers
app.set('io', io);

// Start listening
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

**WHY `app.set('io', io)`?**  
Controllers don't import Socket.io directly. Instead, we store `io` on the Express app, and access it via `req.app.get('io')` inside any controller. This is a clean pattern used in production.

## 3.2 How Express Works

Express is a minimal **web framework** for Node.js. It handles:

```
Client Request ──▶ Middleware ──▶ Route ──▶ Controller ──▶ Response
```

1. **Middleware** processes the request first (parse JSON, check auth)
2. **Route** matches the URL to the right handler
3. **Controller** contains the actual business logic
4. **Response** is sent back to the client

## 3.3 How Routes Are Structured

Each resource (`menu`, `orders`, `tables`, etc.) has its own route file:

```javascript
// routes/menuRoutes.js
const router = express.Router();

// Public routes — anyone can access
router.get('/', getAllMenuItems);       // GET /api/menu
router.get('/:id', getMenuItem);       // GET /api/menu/123

// Protected routes — admin only
router.post('/', protect, authorize('owner'), createMenuItem);
router.put('/:id', protect, authorize('owner'), updateMenuItem);
router.delete('/:id', protect, authorize('owner'), deleteMenuItem);
```

**WHY this pattern?**
- `protect` middleware checks the JWT token
- `authorize('owner')` checks if the user has the correct role
- If either fails, the request is rejected before reaching the controller

## 3.4 How Controllers Work

Controllers are **functions** that handle the actual logic. Each one follows this pattern:

```javascript
exports.createOrder = async (req, res) => {
    try {
        // 1. Extract and validate data from request
        const { tableNumber, customerName, items } = req.body;

        // 2. Business logic (validate table, calculate total)
        const totalAmount = items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );

        // 3. Database operation
        const order = await Order.create(orderData);

        // 4. Side effects (lock table, emit socket event)
        const io = req.app.get('io');
        io.emit('new-order', order);

        // 5. Send response
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
```

**WHY `async/await`?**  
Database operations are asynchronous (they take time). `await` pauses execution until MongoDB responds, making the code readable like synchronous code.

## 3.5 How Middleware Works

Middleware are functions that run **before** the controller:

```javascript
// authMiddleware.js — protect middleware
exports.protect = async (req, res, next) => {
    // 1. Extract token from "Authorization: Bearer <token>" header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // 2. Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    // 4. Pass control to next middleware/controller
    next();
};
```

```javascript
// authorize middleware — checks user role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        next();
    };
};
```

**The flow for a protected route:**

```
Request ──▶ protect() ──▶ authorize('owner') ──▶ Controller
  │            │                │
  │            ▼                ▼
  │       Verify JWT       Check role
  │       Attach user      If not 'owner'
  │       to req           → 403 Forbidden
  │            │
  │            ▼
  │       If no token
  │       → 401 Unauthorized
```

## 3.6 JWT Authentication Flow

```
┌──────────┐                           ┌──────────┐
│  Admin   │                           │  Server  │
└────┬─────┘                           └────┬─────┘
     │                                      │
     │  POST /api/auth/login                │
     │  { mobile, password }                │
     │─────────────────────────────────────▶│
     │                                      │ Find user by mobile
     │                                      │ Compare password (bcrypt)
     │                                      │ Generate JWT token
     │  { token: "eyJ...", user: {...} }    │
     │◀─────────────────────────────────────│
     │                                      │
     │  (Frontend stores token in           │
     │   localStorage)                      │
     │                                      │
     │  GET /api/orders                     │
     │  Authorization: Bearer eyJ...        │
     │─────────────────────────────────────▶│
     │                                      │ protect() verifies token
     │                                      │ authorize() checks role
     │  { orders: [...] }                   │
     │◀─────────────────────────────────────│
```

**WHY JWT?**
- **Stateless**: Server doesn't store session data — the token contains all info
- **Scalable**: Works across multiple servers
- **Self-contained**: Token has user ID and role encoded inside it

## 3.7 Table Locking Logic

When a customer places a **Dine-In** order:

```javascript
// 1. Check table exists and is free
const table = await Table.findOne({ tableNumber });

if (table.isOccupied) {
    return res.status(400).json({ message: 'Table is already occupied' });
}

// 2. Create the order
const order = await Order.create(orderData);

// 3. Lock the table
table.isOccupied = true;
table.currentOrder = order._id;  // Link table to order
await table.save();
```

When payment is received (order closed):

```javascript
// Unlock the table
table.isOccupied = false;
table.currentOrder = null;
await table.save();

// Notify all clients
io.emit('table-available', { tableNumber: order.tableNumber });
```

**WHY lock tables?**  
Prevents two customers from selecting the same table at the same time. The table is "reserved" until payment is complete or order is cancelled.

## 3.8 Order Lifecycle Logic

| Action | Status | Payment | isClosed |
|---|---|---|---|
| Customer places order | `Pending` | `Unpaid` | `false` |
| Admin starts preparing | `Preparing` | `Unpaid` | `false` |
| Admin serves food | `Served` | `Unpaid` | `false` |
| Admin marks as paid | `Served` | `Paid` | `true` |
| Admin cancels order | — | — | `true` + `isCancelled: true` |

## 3.9 Cancel Order Logic

```javascript
exports.cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    // Guards — cannot cancel if:
    if (order.isClosed) return error('Cannot cancel a closed order');
    if (order.isCancelled) return error('Order is already cancelled');
    if (order.paymentStatus === 'Paid') return error('Cannot cancel a paid order');

    // Cancel
    order.isCancelled = true;
    order.isClosed = true;
    await order.save();

    // Free the table (for Dine-In)
    if (order.orderType === 'Dine-In' && order.tableNumber) {
        const table = await Table.findOne({ tableNumber: order.tableNumber });
        table.isOccupied = false;
        table.currentOrder = null;
        await table.save();
    }

    // Real-time notification
    io.emit('order-cancelled', order);
};
```

## 3.10 Password Change + OTP Flow

**Two methods to change password:**

### Method 1: Change Password (logged-in admin)
```
Admin ──▶ POST /api/auth/change-password
          { oldPassword, newPassword, confirmPassword }
          Server verifies old password → hashes new → saves
```

### Method 2: Forgot Password via Email OTP
```
Step 1: Admin ──▶ POST /api/auth/send-reset-otp { mobile }
        Server sends 6-digit OTP to admin's email

Step 2: Admin ──▶ POST /api/auth/verify-reset-otp
        { mobile, otp, newPassword, confirmPassword }
        Server verifies OTP → resets password
```

**OTP Security:**
- OTP is **hashed** with bcrypt before storing (just like passwords)
- OTP **expires** in 5 minutes
- Maximum **3 attempts**, then OTP is invalidated
- **60-second cooldown** between OTP requests

---

# 4. Database Explanation (MongoDB)

## Why MongoDB?

- **Flexible schema** — great for evolving projects
- **JSON-like documents** — maps naturally to JavaScript objects
- **Free hosting** via MongoDB Atlas (cloud)
- **Mongoose ODM** — gives us schema validation, methods, and hooks

## All Models Explained

### 4.1 User Model

```javascript
const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['owner'], default: 'owner' },
    resetOTP: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 }
}, { timestamps: true });
```

**Key features:**
- `mobile` is unique → one account per phone number
- `password` is **never stored in plain text** — hashed via pre-save hook
- `role` is always `'owner'` — this system has only admin users
- `resetOTP`, `otpExpiry`, `otpAttempts` manage the password reset flow

**Pre-save hook (auto-hashing):**
```javascript
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();  // Skip if password unchanged
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
```

**WHY `isModified('password')`?**  
Without this check, the password would be re-hashed every time you save the user (even when updating unrelated fields like `email`). That would corrupt the password.

### 4.2 Menu Model

```javascript
const menuSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true }
}, { timestamps: true });
```

- `category` is a free-text string (was previously an enum, now dynamic)
- `available` lets admin toggle items on/off without deleting them
- `timestamps: true` adds `createdAt` and `updatedAt` automatically

### 4.3 Order Model

```javascript
// Sub-schema for each item in the order
const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
}, { _id: false });  // No _id for sub-documents

const orderSchema = new mongoose.Schema({
    orderToken: { type: String, unique: true, required: true },
    orderType: { type: String, enum: ['Dine-In', 'Parcel'], required: true },
    tableNumber: { type: Number, min: 1 },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, match: /^\d{10}$/ },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Preparing', 'Served'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
    isClosed: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false }
}, { timestamps: true });
```

**WHY `orderToken`?**  
Customers don't have accounts. The `orderToken` is a random string stored in `localStorage` — it lets them track their order even after closing the browser.

**WHY store item `name` and `price` inside the order?**  
Menu prices can change later. By storing the price at order time, we preserve the exact amount the customer was charged.

### 4.4 Table Model

```javascript
const tableSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true, min: 1, max: 20 },
    isActive: { type: Boolean, default: true },
    isOccupied: { type: Boolean, default: false },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });
```

- `isActive` — admin can disable tables (e.g., under maintenance)
- `isOccupied` — `true` when a customer has an active order
- `currentOrder` — **references** the Order document (ObjectId)

### 4.5 Category Model

```javascript
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });
```

Simplest model — just stores unique category names. Admin adds/deletes them dynamically.

## Relationships Between Models

```
┌─────────┐       ┌─────────┐       ┌───────────┐
│  Table   │──────▶│  Order  │◀──────│  Menu     │
│          │ 1:1   │         │  1:N  │  (items)  │
│currentOrder      │ items[] │       │           │
└─────────┘       └─────────┘       └───────────┘
                       │
                       │ belongs to
                       ▼
                  ┌──────────┐
                  │ Category │ (via order.items → menu.category)
                  └──────────┘
```

## Why ObjectId?

`ObjectId` is MongoDB's way of creating unique identifiers. Example: `507f1f77bcf86cd799439011`

- **Globally unique** — no collisions even across servers
- **Contains timestamp** — you can extract creation time from it
- **Used for references** — links documents together (like foreign keys in SQL)

```javascript
currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'  // Tells Mongoose which collection to look in
}
```

When you call `.populate('currentOrder')`, Mongoose replaces the ObjectId with the actual Order document.

---

# 5. Frontend Deep Explanation

## 5.1 React Project Structure

```
src/
├── components/      ← Reusable UI pieces (CardItem, Navbar, etc.)
├── context/         ← Global state management (Auth, Cart)
├── pages/           ← Full page components (Home, Cart, AdminDashboard)
├── services/        ← API calls and socket connection
├── App.jsx          ← Root component with routing
└── main.jsx         ← React entry point (renders App)
```

## 5.2 Context API — Global State

React `Context` lets you share data across components without passing props manually.

### AuthContext — Login State

```javascript
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);     // Current admin user
    const [loading, setLoading] = useState(true); // Loading state

    // On app start: check if token in localStorage is still valid
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.verify()
                .then(res => setUser(res.data.user))
                .catch(() => localStorage.removeItem('token'));
        }
        setLoading(false);
    }, []);

    const login = async (mobile, password) => {
        const response = await authAPI.login(mobile, password);
        localStorage.setItem('token', response.data.token);  // Save token
        setUser(response.data.user);  // Update state
    };

    const logout = () => {
        localStorage.removeItem('token');  // Remove token
        setUser(null);  // Clear state
    };
};
```

**WHY Context?**  
Every admin page needs to know if the user is logged in. Instead of passing `user` as props through 5 levels of components, we use Context — any component can access it directly:

```javascript
const { user, login, logout } = useAuth();
```

### CartContext — Shopping Cart State

```javascript
export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage (survives page refresh)
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Sync cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.findIndex(i => i._id === item._id);
            if (existing >= 0) {
                // Item already in cart → increment quantity
                const updated = [...prev];
                updated[existing].quantity += 1;
                return updated;
            }
            // New item → add with quantity 1
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const getCartTotal = () => 
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```

## 5.3 Routing

```javascript
// App.jsx
<Routes>
    {/* Customer Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/order/:orderId" element={<OrderSuccess />} />

    {/* Admin Routes */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
    <Route path="/admin/tables" element={<AdminTables />} />
    <Route path="/admin/change-password" element={<ChangePassword />} />
</Routes>
```

**WHY `/order/:orderId`?**  
`:orderId` is a **URL parameter** — it matches any value after `/order/`. The component reads it with:

```javascript
const { orderId } = useParams();
```

## 5.4 Protected Routes (Soft Protection)

Instead of a separate `ProtectedRoute` component, each admin page checks auth itself:

```javascript
const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');  // Redirect to login
        }
    }, [user, authLoading, navigate]);
};
```

**WHY check `authLoading`?**  
On page load, `user` is `null` while the token is being verified. Without checking `loading`, the page would flash-redirect to login before verification completes.

## 5.5 How `orderToken` Works

The `orderToken` allows customers to track their order without creating an account:

```javascript
// Cart.jsx — after placing order
const response = await ordersAPI.create(orderData);
const order = response.data.data;

// Save token in browser
localStorage.setItem('orderToken', order.orderToken);

// Navigate to order tracking page
navigate(`/order/${order._id}`);
```

```javascript
// App.jsx — OrderPersistenceChecker
// On every page load, check if there's an active order
const orderToken = localStorage.getItem('orderToken');
if (orderToken) {
    const response = await ordersAPI.getByToken(orderToken);
    const order = response.data.data;

    if (order && !order.isClosed) {
        navigate(`/order/${order._id}`);  // Redirect to order page
    } else {
        localStorage.removeItem('orderToken');  // Clean up closed orders
    }
}
```

**WHY this pattern?**  
Imagine a customer places an order, then accidentally closes the browser. When they open the site again, they're automatically redirected to their order status page — no re-ordering needed.

## 5.6 How API Calls Work

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Organized API functions
export const menuAPI = {
    getAll: () => api.get('/menu'),
    create: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    delete: (id) => api.delete(`/menu/${id}`)
};
```

**WHY Axios interceptors?**  
Instead of manually adding the token to every API call, the interceptor does it automatically. Every request checks `localStorage` and attaches the token if present.

## 5.7 How Dynamic Categories Work (Frontend)

```javascript
// AdminDashboard.jsx
const [categories, setCategories] = useState([]);

// Fetch categories on mount
useEffect(() => {
    if (user) {
        fetchCategories();
    }
}, [user]);

const fetchCategories = async () => {
    const response = await categoriesAPI.getAll();
    setCategories(response.data.data);  // [{_id, name}, ...]
};

// Add new category
const handleAddCategory = async () => {
    await categoriesAPI.create(trimmedName);
    await fetchCategories();  // Refresh the list
    setFormData(prev => ({ ...prev, category: trimmedName }));  // Auto-select
};

// Delete category
const handleDeleteCategory = async (cat) => {
    await categoriesAPI.delete(cat._id);
    await fetchCategories();  // Refresh the list
};
```

The dropdown dynamically renders whatever categories exist:

```jsx
<select name="category" value={formData.category}>
    {categories.map(cat => (
        <option key={cat._id} value={cat.name}>{cat.name}</option>
    ))}
</select>
<button onClick={() => setShowAddCategory(true)}>
    <FiPlus />  {/* "+" button to add new category */}
</button>
```

---

# 6. Real-Time Communication (Socket.io)

## What is WebSocket?

Normal HTTP works like a **walkie-talkie** — you send a request, get a response, done. To get new data, you have to ask again.

WebSocket works like a **phone call** — once connected, both sides can send messages anytime, instantly.

```
HTTP (Traditional):
  Client: "Any new orders?" ──▶ Server: "No"
  Client: "Any new orders?" ──▶ Server: "No"
  Client: "Any new orders?" ──▶ Server: "Yes! Here's one"

WebSocket:
  Client & Server: *connected*
  Server: "New order just came in!" ──▶ Client
  (No polling needed!)
```

## Why Socket.io?

- **Fallback support** — uses WebSocket if available, falls back to HTTP polling
- **Room system** — send events to specific groups (admin room, order room)
- **Auto-reconnection** — handles disconnections automatically
- **Cross-browser** — works everywhere

## Server-Side Setup

```javascript
// server.js
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
});

// Make io accessible to controllers
app.set('io', io);

// socket/socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Admin joins a special room to receive all order events
        socket.on('join-admin', () => {
            socket.join('admin-room');
        });

        // Customer joins their specific order room
        socket.on('join-order', (orderId) => {
            socket.join(`order-${orderId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
```

## Client-Side Setup

```javascript
// services/socket.js
import { io } from 'socket.io-client';

export const socket = io(SOCKET_URL, { autoConnect: false });

export const connectSocket = () => {
    if (!socket.connected) socket.connect();
};

export const joinAdminRoom = () => {
    socket.emit('join-admin');
};
```

## Example Event Flow: Order Placed → Admin Sees Instantly

```
┌──────────────┐                    ┌──────────┐                 ┌──────────────┐
│   Customer   │                    │  Server  │                 │    Admin     │
│   Browser    │                    │          │                 │   Browser    │
└──────┬───────┘                    └────┬─────┘                 └──────┬───────┘
       │                                 │                              │
       │  POST /api/orders               │                              │
       │  { items, customerName }        │                              │
       │────────────────────────────────▶│                              │
       │                                 │                              │
       │                                 │  Save to MongoDB             │
       │                                 │  ┌───────────────┐          │
       │                                 │──│ Order.create() │          │
       │                                 │  └───────────────┘          │
       │                                 │                              │
       │                                 │  io.emit('new-order', order) │
       │                                 │─────────────────────────────▶│
       │                                 │                              │
       │  { success: true, data: order } │                              │ 🔔 Toast!
       │◀────────────────────────────────│                              │ "New order
       │                                 │                              │  received!"
       │  Navigate to /order/123         │                              │
       ▼                                 │                              ▼
```

**Admin listens for the event:**
```javascript
// AdminOrders.jsx
useEffect(() => {
    connectSocket();
    joinAdminRoom();

    socket.on('new-order', (order) => {
        toast.success(`New order from ${order.customerName}!`);
        fetchOrders();  // Refresh order list
    });

    socket.on('order-updated', (order) => {
        // Update the order in state
    });
}, []);
```

---

# 7. Authentication & Security

## 7.1 How JWT Works

JWT (JSON Web Token) is a string with 3 parts:

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJvd25lciJ9.signature
 ──────────────────    ─────────────────────────────────────    ─────────
      HEADER                       PAYLOAD                     SIGNATURE
   (algorithm)            (user ID + role + expiry)         (verification)
```

- **Header**: Algorithm used (HS256)
- **Payload**: Data (user ID, role, expiry time)
- **Signature**: Ensures the token wasn't tampered with (needs `JWT_SECRET`)

**Generation:**
```javascript
const token = jwt.sign(
    { id: user._id, role: user.role },  // Payload
    process.env.JWT_SECRET,             // Secret key
    { expiresIn: '7d' }                // Expires in 7 days
);
```

**Verification:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { id: '507f1f77bc...', role: 'owner', iat: 1616..., exp: 1617... }
```

## 7.2 How Password Hashing Works (bcrypt)

```
Plain text: "myPassword123"
                │
                ▼ bcrypt.hash()
Hashed: "$2b$12$wB/5wYEg0.K3h6rT.1e8BOlCZq..."
                │
                ▼ (stored in database)
```

**WHY hash?**
- If database is hacked, attacker sees `$2b$12$wB/5wYE...`, not `myPassword123`
- Hashing is **one-way** — you can't reverse it
- `bcrypt` adds a **salt** (random data) — even if two users have the same password, their hashes are different

**Comparison:**
```javascript
const isMatch = await bcrypt.compare("myPassword123", hashedPassword);
// true or false — bcrypt handles the comparison internally
```

## 7.3 How OTP Works

```
1. Generate random 6-digit number
   otp = crypto.randomInt(100000, 999999)  // e.g., "847291"

2. Hash the OTP (same reason we hash passwords)
   hashedOtp = await bcrypt.hash(otp, salt)

3. Store hashed OTP + expiry in database
   user.resetOTP = hashedOtp
   user.otpExpiry = Date.now() + 5 * 60 * 1000  // 5 minutes

4. Send plain OTP via email (Brevo API)
   sendOtpEmail(user.email, otp)  // "Your OTP is: 847291"

5. When user submits OTP:
   isValid = await bcrypt.compare(submittedOtp, user.resetOTP)
```

## 7.4 Production Security Tips

| Practice | Our Implementation |
|---|---|
| Never store plain passwords | bcrypt with salt rounds = 12 |
| Never send raw OTPs in API responses | OTP only sent via email |
| Expire sensitive tokens | JWT: 7 days, OTP: 5 minutes |
| Rate limiting | 60-second cooldown between OTP requests |
| Input validation | Both frontend and backend validate |
| Protect admin routes | `protect` + `authorize` middleware |
| Use environment variables | `.env` for secrets, never hardcoded |

---

# 8. Deployment Explanation

## 8.1 Local Development

```
Frontend (Vite):  http://localhost:5173    ← React dev server with hot reload
Backend (Node):   http://localhost:5000    ← Express API server
MongoDB Atlas:    cloud.mongodb.com       ← Remote database
```

**What is localhost?**  
`localhost` = your own computer. `localhost:5000` = "port 5000 on my machine."

## 8.2 How Vite Works

Vite is a **build tool** for React:
- **Dev mode** (`npm run dev`): Runs a fast dev server with instant hot reload
- **Build mode** (`npm run build`): Compiles React into static HTML/CSS/JS files for deployment

## 8.3 Production Deployment

```
┌─────────────────┐        ┌──────────────────┐
│   Render.com    │        │   Render.com     │
│   (Frontend)    │───────▶│   (Backend)      │
│   Static Site   │ API    │   Web Service    │
│                 │ calls  │                  │
└─────────────────┘        └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │  MongoDB Atlas   │
                           │  (Cloud DB)      │
                           └──────────────────┘
```

## 8.4 Environment Variables

```bash
# Backend .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/restaurant
JWT_SECRET=a-long-random-secret-string
PORT=5000
EMAIL_USER=your-email@gmail.com
BREVO_API_KEY=xkeysib-xxx...

# Frontend .env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

**WHY environment variables?**  
- Secrets (passwords, API keys) should **never** be in source code
- Different values for development vs production
- `.env` is in `.gitignore` — never pushed to GitHub

## 8.5 CORS Explanation

**CORS** (Cross-Origin Resource Sharing) = Browser security policy.

By default, `localhost:5173` (frontend) **cannot** call `localhost:5000` (backend) because they're different "origins."

```javascript
// server.js
app.use(cors());  // Allow ALL origins
```

This tells the backend: "Accept requests from any frontend URL."

In production, you'd restrict it: `cors({ origin: 'https://your-frontend.com' })`

---

# 9. Step-by-Step Execution Flow

## Complete Real Flow (Dine-In Order)

```
┌────────────────────────────────────────────────────────────────┐
│  STEP 1: Customer Opens Site                                   │
│  ─────────────────────────────                                 │
│  • Browser loads React app                                     │
│  • OrderPersistenceChecker runs:                               │
│    - Checks localStorage for 'orderToken'                      │
│    - If found + order active → redirects to order page         │
│    - If not found → shows menu normally                        │
│  • Home.jsx fetches: GET /api/menu + GET /api/categories       │
│  • Menu items render as cards with category filter tabs        │
└─────────────────────────────────────────────────────┬──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 2: Customer Browses Menu & Adds Items                    │
│  ──────────────────────────────────────────                    │
│  • Customer clicks "Add to Cart" on MenuCard                   │
│  • CartContext.addToCart() adds item to state                   │
│  • Cart saved to localStorage (persists on refresh)            │
│  • Floating cart bubble shows item count                       │
└─────────────────────────────────────────────────────┬──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 3: Customer Goes to Cart & Enters Details                │
│  ──────────────────────────────────────────────                │
│  • Cart.jsx shows all items with quantity controls             │
│  • Customer selects order type: Dine-In or Parcel              │
│  • For Dine-In: fetches available tables (GET /api/tables)     │
│  • Selects table from dropdown                                 │
│  • Enters name and phone number                                │
│  • Frontend validates all fields                               │
└─────────────────────────────────────────────────────┬──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 4: Customer Places Order                                 │
│  ─────────────────────────────                                 │
│  • Frontend sends: POST /api/orders                            │
│  • Backend validates everything:                               │
│    - Order type valid?                                         │
│    - Customer name ≥ 2 chars?                                  │
│    - Phone is 10 digits?                                       │
│    - Table exists and not occupied? (Dine-In only)             │
│  • Generates unique orderToken                                 │
│  • Creates Order document in MongoDB                           │
│  • Locks the table (isOccupied = true)                         │
│  • Emits Socket.io: 'new-order' + 'table-occupied'            │
│  • Returns order data to frontend                              │
│  • Frontend saves orderToken to localStorage                   │
│  • Cart is cleared                                             │
│  • Navigates to /order/:orderId                                │
└─────────────────────────────────────────────────────┬──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 5: Admin Sees Order Instantly                            │
│  ──────────────────────────────                                │
│  • AdminOrders.jsx is listening via Socket.io                  │
│  • 'new-order' event fires → toast notification appears        │
│  • Order list refreshes → new order shown as "Pending"         │
│  • Admin sees: customer name, phone, items, table number       │
└─────────────────────────────────────────────────────┬──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 6: Admin Updates Status                                  │
│  ────────────────────────────                                  │
│  • Admin clicks "Preparing" → PATCH /api/orders/:id            │
│  • Backend updates status, emits 'order-updated'               │
│  • Customer's OrderSuccess page receives event                 │
│  • Status badge changes: Pending → Preparing → Served          │
└─────────────────────────────────────────────────────┬──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│  STEP 7: Payment Received                                      │
│  ────────────────────────                                      │
│  • Admin clicks "Payment Received"                             │
│  • Backend: PATCH /api/orders/:id/payment                      │
│    - paymentStatus → 'Paid'                                    │
│    - isClosed → true                                           │
│    - Table unlocked (isOccupied = false)                       │
│  • Emits: 'order-updated', 'order-closed', 'table-available'  │
│  • Customer's page shows "Payment Complete"                    │
│  • Customer's localStorage 'orderToken' cleaned up             │
└────────────────────────────────────────────────────────────────┘
```

---

# 10. Common Bugs & Debugging Guide

## 10.1 CORS Error

```
Access to XMLHttpRequest at 'http://localhost:5000/api'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:** Ensure `app.use(cors())` is in `server.js`, and it's placed **before** route definitions.

## 10.2 Blank Page (React)

**Causes:**
- Import errors (wrong path to component)
- JavaScript error in a component (check browser console)
- Missing environment variable (check `VITE_API_URL`)

**Fix:** Open browser DevTools → Console tab → look for red errors.

## 10.3 Token Expired / 401 Unauthorized

```
{ success: false, message: "Not authorized to access this route" }
```

**Causes:**
- JWT token expired (after 7 days)
- Token was corrupted in localStorage
- Backend `JWT_SECRET` changed

**Fix:** Logout → Login again. This generates a fresh token.

## 10.4 MongoDB Not Connecting

```
Error: MongoNetworkError: failed to connect to server
```

**Causes:**
- Wrong `MONGODB_URI` in `.env`
- IP not whitelisted in MongoDB Atlas
- Internet connection issue

**Fix:** Go to MongoDB Atlas → Network Access → Add your IP (or `0.0.0.0/0` for access from anywhere).

## 10.5 Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

## 10.6 localStorage Issues

**Problem:** Cart items persist even after they should be cleared.

**Debug:**
1. Open DevTools → Application tab → Local Storage
2. Check values of `cart`, `orderToken`, `token`, `tableNumber`
3. Manually delete entries to reset state

---

# 11. Learning Section

## What You Learned From This Project

### Backend Skills
| Concept | Real-World Use |
|---|---|
| REST API design | How every web app communicates |
| JWT authentication | Used by Netflix, Instagram, Twitter |
| Middleware pattern | Every Express app uses this |
| MongoDB with Mongoose | NoSQL database management |
| Socket.io real-time | Chat apps, dashboards, notifications |
| Password hashing (bcrypt) | Core security practice |
| Email integration (Brevo) | Transactional emails, OTP |
| Error handling middleware | Production error management |

### Frontend Skills
| Concept | Real-World Use |
|---|---|
| React hooks (useState, useEffect) | Core of modern React |
| Context API | State management (alternative to Redux) |
| React Router | SPA navigation |
| Axios with interceptors | API communication |
| localStorage persistence | Offline-capable apps |
| Form validation | Every web app with forms |
| Conditional rendering | Dynamic UI |
| CSS-in-dark-mode | Modern UI design |

## How This Relates to Real Industry

This project follows the **exact same architecture** used at companies:

```
Your Project            →    Industry Equivalent
──────────────────────────────────────────────────
Express + MongoDB       →    Django + PostgreSQL (Instagram)
JWT Auth                →    OAuth2 + JWT (Google)
Socket.io               →    WebSockets (Slack, Discord)
React + Context         →    React + Redux (Facebook)
REST API                →    REST / GraphQL (GitHub)
Axios interceptors      →    API Gateway pattern
```

## How This Can Become a SaaS

A **SaaS (Software as a Service)** means multiple restaurants use your platform:

```
┌──────────────────────────────────────────────────────┐
│                   Multi-Tenant SaaS                   │
│                                                       │
│  Restaurant A  ──▶  your-app.com/restaurant-a        │
│  Restaurant B  ──▶  your-app.com/restaurant-b        │
│  Restaurant C  ──▶  your-app.com/restaurant-c        │
│                                                       │
│  Each restaurant gets:                                │
│  • Their own menu                                     │
│  • Their own orders                                   │
│  • Their own tables                                   │
│  • Custom branding                                    │
│  • QR code for customers                              │
│                                                       │
│  Revenue model:                                       │
│  • Monthly subscription (₹499/month)                  │
│  • Commission per order (2%)                          │
│  • Premium features (analytics, SMS)                  │
└──────────────────────────────────────────────────────┘
```

## How to Extend This Project Further

| Extension | Difficulty | Description |
|---|---|---|
| **QR Code Ordering** | Easy | Generate QR code per table → scans open menu |
| **Image Upload** | Medium | Cloudinary integration for dish photos |
| **SMS Notifications** | Medium | Twilio for order updates via SMS |
| **Analytics Dashboard** | Medium | Charts for revenue, popular items, peak hours |
| **Customer Reviews** | Easy | Rating system for menu items |
| **Multi-Language** | Medium | i18n support (Hindi, English) |
| **Payment Gateway** | Hard | Razorpay/Stripe integration for online payments |
| **Kitchen Display** | Medium | Separate screen for kitchen staff |
| **Inventory Management** | Hard | Track ingredients, auto-disable when out of stock |
| **Mobile App** | Hard | React Native app using same backend API |

---

> **📝 Note:** This documentation covers the project as of February 2026. As you add new features, update this document to keep it current.

---

*Built with ❤️ as a learning project. Every line of code teaches something.*
