import { FiPlus, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './MenuCard.css';

const MenuCard = ({ item }) => {
    const { cartItems, addToCart } = useCart();
    const isInCart = cartItems.some((i) => i._id === item._id);
    const cartItem = cartItems.find((i) => i._id === item._id);

    return (
        <div className="menu-card">
            <div className="menu-card-image">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <div className="placeholder-image">
                        <span>🍽️</span>
                    </div>
                )}
                {!item.available && <div className="unavailable-badge">Unavailable</div>}
            </div>

            <div className="menu-card-content">
                <div className="menu-card-header">
                    <h3 className="menu-card-title">{item.name}</h3>
                    <span className="menu-card-price">₹{item.price}</span>
                </div>

                <p className="menu-card-description">{item.description || 'Delicious dish prepared with love'}</p>

                <button
                    className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                >
                    {isInCart ? (
                        <>
                            <FiCheck /> Added ({cartItem?.quantity})
                        </>
                    ) : (
                        <>
                            <FiPlus /> Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MenuCard;
