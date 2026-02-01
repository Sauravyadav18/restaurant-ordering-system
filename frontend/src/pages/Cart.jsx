import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, tableNumber, setTableNumber, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [tableInput, setTableInput] = useState(tableNumber || '');

    const handlePlaceOrder = async () => {
        if (!tableInput || parseInt(tableInput) < 1) {
            toast.error('Please enter a valid table number');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                tableNumber: parseInt(tableInput),
                items: cartItems.map((item) => ({
                    menuItem: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await ordersAPI.create(orderData);

            if (response.data.success) {
                setTableNumber(parseInt(tableInput));
                clearCart();
                toast.success('Order placed successfully!');
                navigate(`/order/${response.data.data._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="empty-cart">
                    <FiShoppingBag className="empty-cart-icon" />
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items from our menu</p>
                    <button className="browse-menu-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft /> Browse Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft /> Back to Menu
                    </button>
                    <h1>Your Cart</h1>
                </div>

                <div className="cart-content">
                    <div className="cart-items-section">
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <CartItem key={item._id} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        <div className="table-input-section">
                            <label htmlFor="tableNumber">Table Number</label>
                            <input
                                type="number"
                                id="tableNumber"
                                min="1"
                                placeholder="Enter your table number"
                                value={tableInput}
                                onChange={(e) => setTableInput(e.target.value)}
                            />
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                        <div className="summary-row">
                            <span>Taxes</span>
                            <span>Included</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{getCartTotal()}</span>
                        </div>

                        <button
                            className="place-order-btn"
                            onClick={handlePlaceOrder}
                            disabled={loading}
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
