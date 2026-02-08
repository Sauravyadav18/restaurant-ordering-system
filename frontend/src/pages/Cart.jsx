import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI, tablesAPI } from '../services/api';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiArrowLeft, FiUser } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, setTableNumber, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [availableTables, setAvailableTables] = useState([]);
    const [tablesLoading, setTablesLoading] = useState(true);

    // Fetch available tables
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await tablesAPI.getAvailable();
                if (response.data.success) {
                    setAvailableTables(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching tables:', error);
                toast.error('Failed to load available tables');
            } finally {
                setTablesLoading(false);
            }
        };
        fetchTables();
    }, []);

    const handlePlaceOrder = async () => {
        // Validate customer name
        const trimmedName = customerName.trim();
        if (!trimmedName || trimmedName.length < 2) {
            toast.error('Please enter your name (at least 2 characters)');
            return;
        }

        // Validate table selection
        if (!selectedTable) {
            toast.error('Please select a table');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                tableNumber: parseInt(selectedTable),
                customerName: trimmedName,
                items: cartItems.map((item) => ({
                    menuItem: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await ordersAPI.create(orderData);

            if (response.data.success) {
                setTableNumber(parseInt(selectedTable));
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

                        <div className="customer-input-section">
                            <label htmlFor="customerName">
                                <FiUser /> Your Name
                            </label>
                            <input
                                type="text"
                                id="customerName"
                                placeholder="Enter your name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        <div className="table-input-section">
                            <label htmlFor="tableNumber">Select Table</label>
                            {tablesLoading ? (
                                <div className="table-loading">Loading tables...</div>
                            ) : availableTables.length === 0 ? (
                                <div className="no-tables-message">
                                    No tables available at the moment. Please wait.
                                </div>
                            ) : (
                                <select
                                    id="tableNumber"
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    className="table-select"
                                >
                                    <option value="">-- Select a table --</option>
                                    {availableTables.map((table) => (
                                        <option key={table._id} value={table.tableNumber}>
                                            Table {table.tableNumber}
                                        </option>
                                    ))}
                                </select>
                            )}
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
                            disabled={loading || tablesLoading || availableTables.length === 0}
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
