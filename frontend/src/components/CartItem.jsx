import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="cart-item">
            <div className="cart-item-image">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <div className="cart-placeholder">🍽️</div>
                )}
            </div>

            <div className="cart-item-details">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-price">₹{item.price} each</p>
            </div>

            <div className="cart-item-controls">
                <div className="quantity-controls">
                    <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                        <FiMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                        <FiPlus />
                    </button>
                </div>

                <span className="item-total">₹{item.price * item.quantity}</span>

                <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id)}
                >
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
