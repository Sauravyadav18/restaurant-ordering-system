import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order/:orderId" element={<OrderSuccess />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
              </Routes>
            </main>
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
