import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI, tablesAPI } from '../services/api';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiArrowLeft, FiUser, FiHome, FiPackage, FiEdit2, FiPlus } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, setTableNumber, getCartTotal, clearCart, editMode, cancelEditMode } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState('');
    const [customerName, setCustomerName] = useState('');
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

    // Pre-fill form in edit mode
    useEffect(() => {
        if (editMode && editMode.orderData) {
            setCustomerName(editMode.orderData.customerName || '');
            setOrderType(editMode.orderData.orderType || 'Dine-In');
            if (editMode.orderData.tableNumber) {
                setSelectedTable(editMode.orderData.tableNumber.toString());
            }
        }
    }, [editMode]);

    const handlePlaceOrder = async () => {
        // Validate customer name (only for new orders)
        if (!editMode) {
            const trimmedName = customerName.trim();
            if (!trimmedName || trimmedName.length < 2) {
                toast.error('Please enter your name (at least 2 characters)');
                return;
            }

            // Validate table selection for Dine-In orders
            if (orderType === 'Dine-In' && !selectedTable) {
                toast.error('Please select a table for Dine-In orders');
                return;
            }
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            let response;

            if (editMode) {
                // Edit or Add items mode
                const items = cartItems.map((item) => ({
                    menuItem: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }));

                if (editMode.mode === 'edit') {
                    // Full order update
                    response = await ordersAPI.updateOrder(editMode.orderId, { items });
                    toast.success('Order updated successfully!');
                } else {
                    // Add items only
                    response = await ordersAPI.addItems(editMode.orderId, items);
                    toast.success('Items added successfully!');
                }

                clearCart();
                navigate(`/order/${editMode.orderId}`);
            } else {
                // New order
                const orderData = {
                    orderType,
                    customerName: customerName.trim(),
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

                response = await ordersAPI.create(orderData);

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
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process order');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        cancelEditMode();
        if (editMode) {
            navigate(`/order/${editMode.orderId}`);
        }
    };

    if (cartItems.length === 0 && !editMode) {
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

    // Get button text based on mode
    const getButtonText = () => {
        if (loading) return 'Processing...';
        if (editMode) {
            return editMode.mode === 'edit' ? 'Update Order' : 'Add Items to Order';
        }
        return 'Place Order';
    };

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <FiArrowLeft /> Back to Menu
                    </button>
                    <h1>
                        {editMode ? (
                            <>
                                {editMode.mode === 'edit' ? <FiEdit2 /> : <FiPlus />}
                                {editMode.mode === 'edit' ? ' Edit Order' : ' Add Items'}
                            </>
                        ) : 'Your Cart'}
                    </h1>
                </div>

                {/* Edit Mode Info Banner */}
                {editMode && (
                    <div className={`edit-info-banner ${editMode.mode}`}>
                        <div className="edit-info-text">
                            <strong>Order #{editMode.orderId.slice(-6).toUpperCase()}</strong>
                            {editMode.mode === 'edit' ? (
                                <span>Modify your order items below</span>
                            ) : (
                                <span>Add new items to your existing order</span>
                            )}
                        </div>
                        <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    </div>
                )}

                <div className="cart-content">
                    <div className="cart-items-section">
                        {cartItems.length === 0 ? (
                            <div className="empty-cart-items">
                                <p>No items added yet. Go back to menu to add items.</p>
                                <button className="browse-menu-btn" onClick={() => navigate('/')}>
                                    <FiArrowLeft /> Browse Menu
                                </button>
                            </div>
                        ) : (
                            <div className="cart-items-list">
                                {cartItems.map((item) => (
                                    <CartItem key={item._id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        {/* Only show customer info form for new orders */}
                        {!editMode && (
                            <>
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
                            </>
                        )}

                        {/* Show order info in edit mode */}
                        {editMode && editMode.orderData && (
                            <div className="edit-order-info">
                                <div className="info-row">
                                    <span>Customer</span>
                                    <strong>{editMode.orderData.customerName}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Order Type</span>
                                    <strong>{editMode.orderData.orderType || 'Dine-In'}</strong>
                                </div>
                                {editMode.orderData.tableNumber && (
                                    <div className="info-row">
                                        <span>Table</span>
                                        <strong>Table {editMode.orderData.tableNumber}</strong>
                                    </div>
                                )}
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
                            className={`place-order-btn ${editMode ? editMode.mode : ''}`}
                            onClick={handlePlaceOrder}
                            disabled={loading || cartItems.length === 0 || (!editMode && orderType === 'Dine-In' && (tablesLoading || availableTables.length === 0))}
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
