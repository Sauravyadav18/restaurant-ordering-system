import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ordersAPI } from './services/api';
import Navbar from './components/Navbar';
import FloatingCart from './components/FloatingCart';
import Home from './pages/Home';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminTables from './pages/AdminTables';
import './App.css';

// Wrapper to conditionally show FloatingCart
const FloatingCartWrapper = () => {
  const location = useLocation();
  const hideOnPaths = ['/cart', '/admin', '/order'];

  // Hide floating cart on cart page and admin pages
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;
  return <FloatingCart />;
};

// Order persistence checker
const OrderPersistenceChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkActiveOrder = async () => {
      // Skip check for admin pages
      if (location.pathname.startsWith('/admin')) {
        setChecked(true);
        return;
      }

      // Skip if already on order page
      if (location.pathname.startsWith('/order/')) {
        setChecked(true);
        return;
      }

      const orderToken = localStorage.getItem('orderToken');

      if (!orderToken) {
        setChecked(true);
        return;
      }

      try {
        const response = await ordersAPI.getByToken(orderToken);
        const order = response.data.data;

        if (order && !order.isClosed) {
          // Redirect to order status page
          navigate(`/order/${order._id}`, { replace: true });
        } else {
          // Order is closed, clear token
          localStorage.removeItem('orderToken');
        }
      } catch (error) {
        // Order not found or error, clear token
        localStorage.removeItem('orderToken');
      } finally {
        setChecked(true);
      }
    };

    checkActiveOrder();
  }, [navigate, location.pathname]);

  // Don't render anything until check is complete
  if (!checked && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/order/')) {
    return (
      <div className="persistence-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <OrderPersistenceChecker />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order/:orderId" element={<OrderSuccess />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/tables" element={<AdminTables />} />
              </Routes>
            </main>
            <FloatingCartWrapper />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e1e30',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              },
              success: {
                iconTheme: {
                  primary: '#10ac84',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ff6b6b',
                  secondary: '#fff'
                }
              }
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
