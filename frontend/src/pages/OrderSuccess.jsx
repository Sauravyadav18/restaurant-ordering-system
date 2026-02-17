import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { socket, connectSocket, joinOrderRoom, leaveOrderRoom } from '../services/socket';
import { FiCheck, FiClock, FiHome, FiPackage, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
        connectSocket();
        joinOrderRoom(orderId);

        // Listen for order updates
        socket.on('order-updated', (updatedOrder) => {
            if (updatedOrder._id === orderId) {
                setOrder(updatedOrder);
                toast.success(`Order status updated: ${updatedOrder.status}`);

                // If order is closed, clear the token
                if (updatedOrder.isClosed) {
                    localStorage.removeItem('orderToken');
                }
            }
        });

        socket.on('order-closed', (closedOrder) => {
            if (closedOrder._id === orderId) {
                localStorage.removeItem('orderToken');
            }
        });

        // Listen for order cancellation
        socket.on('order-cancelled', (cancelledOrder) => {
            if (cancelledOrder._id === orderId) {
                localStorage.removeItem('orderToken');
                toast.error('Your order has been cancelled by the restaurant.', {
                    duration: 5000,
                    icon: '🚫'
                });
                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            }
        });

        return () => {
            leaveOrderRoom(orderId);
            socket.off('order-updated');
            socket.off('order-closed');
            socket.off('order-cancelled');
        };
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await ordersAPI.getOne(orderId);
            const orderData = response.data.data;

            // If order is cancelled, redirect to home
            if (orderData.isCancelled) {
                localStorage.removeItem('orderToken');
                toast.error('This order has been cancelled.', {
                    duration: 4000,
                    icon: '🚫'
                });
                navigate('/', { replace: true });
                return;
            }

            setOrder(orderData);

            // If order is closed, clear the token
            if (orderData.isClosed) {
                localStorage.removeItem('orderToken');
            }
        } catch (error) {
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-IN', options).replace(',', ' –');
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'Pending': return 1;
            case 'Preparing': return 2;
            case 'Served': return 3;
            default: return 1;
        }
    };

    if (loading) {
        return (
            <div className="order-success-page">
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-success-page">
                <div className="error-state">
                    <h2>Order not found</h2>
                    <button onClick={() => navigate('/')}>Go to Menu</button>
                </div>
            </div>
        );
    }

    const currentStep = getStatusStep(order.status);

    return (
        <div className="order-success-page">
            <div className="success-container">
                <div className="success-header">
                    <div className="success-icon">
                        <FiCheck />
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p className="order-id">Order #{order._id.slice(-6).toUpperCase()}</p>
                </div>

                <div className="order-meta">
                    <div className={`order-type-badge ${order.orderType?.toLowerCase() || 'dine-in'}`}>
                        {order.orderType === 'Parcel' ? <FiPackage /> : <FiHome />}
                        {order.orderType || 'Dine-In'}
                    </div>
                    <div className="order-date">
                        <FiCalendar />
                        {formatDate(order.createdAt)}
                    </div>
                </div>

                <div className="order-progress">
                    <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                        <div className="step-icon">
                            <FiClock />
                        </div>
                        <span>Pending</span>
                    </div>
                    <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                        <div className="step-icon">🍳</div>
                        <span>Preparing</span>
                    </div>
                    <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="step-icon">
                            <FiCheck />
                        </div>
                        <span>Served</span>
                    </div>
                </div>

                {order.paymentStatus === 'Paid' && (
                    <div className="payment-complete-badge">
                        <FiCheck /> Payment Complete - Thank You!
                    </div>
                )}

                <div className="order-details-card">
                    <div className="details-header">
                        <div>
                            <h3>Order Details</h3>
                            <span className="customer-name">{order.customerName}</span>
                        </div>
                        {order.orderType === 'Dine-In' && order.tableNumber && (
                            <span className="table-badge">Table {order.tableNumber}</span>
                        )}
                    </div>

                    <div className="order-items-list">
                        {order.items.map((item, index) => (
                            <div key={index} className="order-item-row">
                                <span className="item-qty">{item.quantity}x</span>
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="order-total-row">
                        <span>Total Amount</span>
                        <span className="total-amount">₹{order.totalAmount}</span>
                    </div>
                </div>

                <div className="realtime-notice">
                    <FiClock />
                    <span>This page updates in real-time. Stay tuned for status updates!</span>
                </div>

                <button className="home-btn" onClick={() => navigate('/')}>
                    <FiHome /> Back to Menu
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;
