import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';
import './FloatingCart.css';

const FloatingCart = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <button
            className={`floating-cart ${totalItems > 0 ? 'has-items' : ''}`}
            onClick={() => navigate('/cart')}
            aria-label={`View cart with ${totalItems} items`}
        >
            <FiShoppingCart className="cart-icon" />
            {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
            )}
        </button>
    );
};

export default FloatingCart;
