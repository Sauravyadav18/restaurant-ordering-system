# Restaurant Menu & Ordering System 🍽️

A full-stack restaurant ordering application with real-time updates.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.io

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017

### 1. Setup Backend

```bash
cd backend
npm install
npm run seed   # Creates admin user and sample menu items
npm run dev    # Starts server on port 5000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev    # Starts on port 5173
```

### 3. Access the Application

- **Customer Menu**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login

## Admin Credentials

```
Mobile: 7078490901
Password: 490901
```

## Features

### Customer Side
- Browse menu by categories (Starters, Main Course, Drinks, Desserts)
- Add items to cart
- Place order with table number
- Real-time order status tracking

### Admin Side
- Add/Edit/Delete menu items
- View all orders
- Update order status (Pending → Preparing → Served)
- Real-time new order notifications

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/menu | Get all menu items |
| POST | /api/menu | Add menu item (Admin) |
| PUT | /api/menu/:id | Update item (Admin) |
| DELETE | /api/menu/:id | Delete item (Admin) |
| POST | /api/orders | Place order |
| GET | /api/orders | Get all orders (Admin) |
| PATCH | /api/orders/:id | Update status (Admin) |

## Socket.io Events

- `new-order` - Emitted when customer places order
- `order-updated` - Emitted when admin updates status
