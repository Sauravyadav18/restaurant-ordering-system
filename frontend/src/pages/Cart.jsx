import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI, tablesAPI } from '../services/api';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiArrowLeft, FiUser, FiPhone, FiHome, FiPackage } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, setTableNumber, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderType, setOrderType] = useState('Dine-In');
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
        const trimmedName = customerName.trim();
        if (!trimmedName || trimmedName.length < 2) {
            toast.error('Please enter your name (at least 2 characters)');
            return;
        }

        const trimmedPhone = customerPhone.trim();
        if (!trimmedPhone || !/^\d{10}$/.test(trimmedPhone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        // Validate table selection for Dine-In orders
        if (orderType === 'Dine-In' && !selectedTable) {
            toast.error('Please select a table for Dine-In orders');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                orderType,
                customerName: trimmedName,
                customerPhone: trimmedPhone,
                items: cartItems.map((item) => ({
                    menuItem: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // Add tableNumber only for Dine-In orders
            if (orderType === 'Dine-In') {
                orderData.tableNumber = parseInt(selectedTable);
            }

            const response = await ordersAPI.create(orderData);

            if (response.data.success) {
                const order = response.data.data;

                // Store order token in localStorage for persistence
                localStorage.setItem('orderToken', order.orderToken);

                if (orderType === 'Dine-In') {
                    setTableNumber(parseInt(selectedTable));
                }
                clearCart();
                toast.success('Order placed successfully!');
                navigate(`/order/${order._id}`);
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

                        <div className="customer-input-section">
                            <label htmlFor="customerPhone">
                                <FiPhone /> Phone Number
                            </label>
                            <input
                                type="tel"
                                id="customerPhone"
                                placeholder="Enter 10-digit phone number"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                maxLength={10}
                            />
                        </div>

                        <div className="order-type-section">
                            <label>Order Type</label>
                            <div className="order-type-options">
                                <button
                                    className={`order-type-btn ${orderType === 'Dine-In' ? 'active' : ''}`}
                                    onClick={() => setOrderType('Dine-In')}
                                >
                                    <FiHome /> Dine-In
                                </button>
                                <button
                                    className={`order-type-btn ${orderType === 'Parcel' ? 'active' : ''}`}
                                    onClick={() => {
                                        setOrderType('Parcel');
                                        setSelectedTable('');
                                    }}
                                >
                                    <FiPackage /> Parcel
                                </button>
                            </div>
                        </div>

                        {orderType === 'Dine-In' && (
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
                        )}

                        {orderType === 'Parcel' && (
                            <div className="parcel-notice">
                                <FiPackage />
                                <span>Your order will be packed for takeaway</span>
                            </div>
                        )}

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
                            disabled={loading || cartItems.length === 0 || (orderType === 'Dine-In' && (tablesLoading || availableTables.length === 0))}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
