import { useState } from 'react';
import { FiClock, FiUser, FiPhone, FiDollarSign, FiCheck, FiHome, FiPackage, FiCalendar, FiXCircle } from 'react-icons/fi';
import './OrderCard.css';

const OrderCard = ({ order, onStatusChange, onPaymentReceived, onCancelOrder, showActions = true, isClosed = false }) => {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const statusColors = {
        Pending: '#feca57',
        Preparing: '#00d2d3',
        Served: '#10ac84'
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return d.toLocaleString('en-IN', options).replace(',', ' –');
    };

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        if (onCancelOrder) {
            onCancelOrder(order._id);
        }
        setShowCancelConfirm(false);
    };

    // Check if order is eligible for cancellation
    const canCancel = !order.isClosed && !order.isCancelled && order.paymentStatus === 'Unpaid';

    return (
        <div className={`order-card ${isClosed ? 'closed' : ''} ${order.isCancelled ? 'cancelled' : ''}`}>
            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="cancel-confirm-overlay">
                    <div className="cancel-confirm-modal">
                        <h4>Cancel Order?</h4>
                        <p>Are you sure you want to cancel order #{order._id.slice(-6).toUpperCase()}?</p>
                        <p className="cancel-warning">This action cannot be undone.</p>
                        <div className="cancel-confirm-actions">
                            <button className="confirm-yes" onClick={handleConfirmCancel}>
                                Yes, Cancel Order
                            </button>
                            <button className="confirm-no" onClick={() => setShowCancelConfirm(false)}>
                                No, Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="order-card-header">
                <div className="order-info">
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                    <span
                        className="order-status"
                        style={{ background: statusColors[order.status] }}
                    >
                        {order.status}
                    </span>
                    {order.paymentStatus === 'Paid' && (
                        <span className="payment-badge paid">
                            <FiDollarSign /> Paid
                        </span>
                    )}
                    {order.isClosed && !order.isCancelled && (
                        <span className="closed-badge">
                            <FiCheck /> Closed
                        </span>
                    )}
                    {order.isCancelled && (
                        <span className="cancelled-badge">
                            <FiXCircle /> Cancelled
                        </span>
                    )}
                </div>
                <div className="order-type-info">
                    <span className={`order-type-badge ${order.orderType?.toLowerCase() || 'dine-in'}`}>
                        {order.orderType === 'Parcel' ? <FiPackage /> : <FiHome />}
                        {order.orderType || 'Dine-In'}
                    </span>
                    {order.orderType === 'Dine-In' && order.tableNumber && (
                        <span className="table-badge">Table {order.tableNumber}</span>
                    )}
                </div>
            </div>

            <div className="customer-info">
                <FiUser />
                <span className="customer-name">{order.customerName || 'Customer'}</span>
                {order.customerPhone && (
                    <>
                        <span className="customer-separator">•</span>
                        <FiPhone />
                        <a href={`tel:${order.customerPhone}`} className="customer-phone">{order.customerPhone}</a>
                    </>
                )}
            </div>

            <div className="order-date-info">
                <FiCalendar />
                <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="order-items">
                {order.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="order-footer">
                <div className="order-total">
                    Total: <span>₹{order.totalAmount}</span>
                </div>
            </div>

            {showActions && !isClosed && !order.isCancelled && onStatusChange && (
                <div className="order-actions">
                    <div className="status-actions">
                        {order.status === 'Pending' && (
                            <button
                                className="action-btn preparing"
                                onClick={() => onStatusChange(order._id, 'Preparing')}
                            >
                                Start Preparing
                            </button>
                        )}
                        {order.status === 'Preparing' && (
                            <button
                                className="action-btn served"
                                onClick={() => onStatusChange(order._id, 'Served')}
                            >
                                Mark as Served
                            </button>
                        )}
                        {order.status === 'Served' && order.paymentStatus === 'Unpaid' && onPaymentReceived && (
                            <button
                                className="action-btn payment"
                                onClick={() => onPaymentReceived(order._id)}
                            >
                                <FiDollarSign /> Payment Received
                            </button>
                        )}
                        {order.status === 'Served' && order.paymentStatus === 'Paid' && (
                            <span className="completed-text">✓ Order Closed</span>
                        )}
                    </div>

                    {/* Cancel Button - visible for active unpaid orders */}
                    {canCancel && onCancelOrder && (
                        <button className="action-btn cancel" onClick={handleCancelClick}>
                            <FiXCircle /> Cancel Order
                        </button>
                    )}
                </div>
            )}

            {isClosed && !order.isCancelled && (
                <div className="order-actions">
                    <span className="completed-text">✓ Order Completed</span>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
