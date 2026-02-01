import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { socket, connectSocket, joinOrderRoom, leaveOrderRoom } from '../services/socket';
import { FiCheck, FiClock, FiHome } from 'react-icons/fi';
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
            }
        });

        return () => {
            leaveOrderRoom(orderId);
            socket.off('order-updated');
        };
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await ordersAPI.getOne(orderId);
            setOrder(response.data.data);
        } catch (error) {
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
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

                <div className="order-details-card">
                    <div className="details-header">
                        <h3>Order Details</h3>
                        <span className="table-badge">Table {order.tableNumber}</span>
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
