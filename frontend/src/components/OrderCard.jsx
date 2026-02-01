import { FiClock, FiUser } from 'react-icons/fi';
import './OrderCard.css';

const OrderCard = ({ order, onStatusChange, showActions = true }) => {
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
        <div className="order-card">
            <div className="order-card-header">
                <div className="order-info">
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                    <span
                        className="order-status"
                        style={{ background: statusColors[order.status] }}
                    >
                        {order.status}
                    </span>
                </div>
                <div className="table-info">
                    <FiUser />
                    <span>Table {order.tableNumber}</span>
                </div>
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
                <div className="order-time">
                    <FiClock />
                    <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-total">
                    Total: <span>₹{order.totalAmount}</span>
                </div>
            </div>

            {showActions && onStatusChange && (
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
                    {order.status === 'Served' && (
                        <span className="completed-text">✓ Completed</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderCard;
