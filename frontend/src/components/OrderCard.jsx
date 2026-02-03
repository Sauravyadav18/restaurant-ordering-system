import { FiClock, FiUser, FiDollarSign, FiCheck } from 'react-icons/fi';
import './OrderCard.css';

const OrderCard = ({ order, onStatusChange, onPaymentReceived, showActions = true, isClosed = false }) => {
    const statusColors = {
        Pending: '#feca57',
        Preparing: '#00d2d3',
        Served: '#10ac84'
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`order-card ${isClosed ? 'closed' : ''}`}>
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
                    {order.isClosed && (
                        <span className="closed-badge">
                            <FiCheck /> Closed
                        </span>
                    )}
                </div>
                <div className="table-info">
                    <span className="table-badge">Table {order.tableNumber}</span>
                </div>
            </div>

            {order.customerName && (
                <div className="customer-info">
                    <FiUser />
                    <span className="customer-name">{order.customerName}</span>
                </div>
            )}

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
                <div className="order-time">
                    <FiClock />
                    <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-total">
                    Total: <span>₹{order.totalAmount}</span>
                </div>
            </div>

            {showActions && !isClosed && onStatusChange && (
                <div className="order-actions">
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
            )}

            {isClosed && (
                <div className="order-actions">
                    <span className="completed-text">✓ Order Completed</span>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
