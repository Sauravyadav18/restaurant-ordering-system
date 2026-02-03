import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiHome } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { getCartCount } = useCart();
    const { user, logout } = useAuth();
    const location = useLocation();
    const cartCount = getCartCount();

    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🍽️</span>
                    <span className="brand-text">Foodie Haven</span>
                </Link>

                <div className="navbar-links">
                    {!isAdminPage && (
                        <>
                            <Link to="/" className="nav-link">
                                <FiHome /> Menu
                            </Link>
                            <Link to="/cart" className="nav-link cart-link">
                                <FiShoppingCart />
                                <span>Cart</span>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                        </>
                    )}

                    {isAdminPage && user ? (
                        <>
                            <Link to="/admin" className="nav-link">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="nav-btn logout-btn">
                                Logout
                            </button>
                        </>
                    ) : !isAdminPage ? (
                        <Link to="/admin/login" className="nav-link">
                            <FiUser /> Admin
                        </Link>
                    ) : null}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
