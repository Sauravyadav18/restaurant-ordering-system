import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { socket, connectSocket, joinAdminRoom } from '../services/socket';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './AdminOrders.css';

const AdminOrders = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('today');
    const [showClosed, setShowClosed] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchOrders();
            connectSocket();
            joinAdminRoom();

            // Listen for new orders
            socket.on('new-order', (newOrder) => {
                setOrders((prev) => [newOrder, ...prev]);
                toast.success(`New order from Table ${newOrder.tableNumber}!`, {
                    icon: '🔔'
                });
            });

            // Listen for order updates
            socket.on('order-updated', (updatedOrder) => {
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === updatedOrder._id ? updatedOrder : order
                    )
                );
            });

            // Listen for order closed
            socket.on('order-closed', (closedOrder) => {
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === closedOrder._id ? closedOrder : order
                    )
                );
            });

            return () => {
                socket.off('new-order');
                socket.off('order-updated');
                socket.off('order-closed');
            };
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [dateFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateFilter !== 'all') {
                params.dateFilter = dateFilter;
            }
            const response = await ordersAPI.getAll(params);
            setOrders(response.data.data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handlePaymentReceived = async (orderId) => {
        try {
            await ordersAPI.updatePayment(orderId);
            toast.success('Payment received! Order closed.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update payment');
        }
    };

    // Separate active and closed orders
    const activeOrders = orders.filter((order) => !order.isClosed);
    const closedOrders = orders.filter((order) => order.isClosed);

    // Filter active orders by status
    const filteredActiveOrders = activeOrders.filter((order) => {
        if (statusFilter === 'all') return true;
        return order.status === statusFilter;
    });

    const getOrderCounts = () => {
        return {
            all: activeOrders.length,
            Pending: activeOrders.filter((o) => o.status === 'Pending').length,
            Preparing: activeOrders.filter((o) => o.status === 'Preparing').length,
            Served: activeOrders.filter((o) => o.status === 'Served').length
        };
    };

    const counts = getOrderCounts();

    if (authLoading) {
        return <div className="admin-loading">Loading...</div>;
    }

    return (
        <div className="admin-orders">
            <div className="orders-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/admin')}>
                        <FiArrowLeft /> Back to Menu
                    </button>
                    <h1>Order Management</h1>
                </div>
                <div className="header-right">
                    <select
                        className="date-filter-select"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">Last 7 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button className="refresh-btn" onClick={fetchOrders}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {/* Active Orders Section */}
            <div className="orders-section">
                <h2 className="section-title">
                    <span className="fire-icon">🔥</span> Active Orders
                    <span className="section-count">{activeOrders.length}</span>
                </h2>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All <span className="count">{counts.all}</span>
                    </button>
                    <button
                        className={`filter-tab pending ${statusFilter === 'Pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Pending')}
                    >
                        Pending <span className="count">{counts.Pending}</span>
                    </button>
                    <button
                        className={`filter-tab preparing ${statusFilter === 'Preparing' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Preparing')}
                    >
                        Preparing <span className="count">{counts.Preparing}</span>
                    </button>
                    <button
                        className={`filter-tab served ${statusFilter === 'Served' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Served')}
                    >
                        Served <span className="count">{counts.Served}</span>
                    </button>
                </div>

                <div className="realtime-indicator">
                    <span className="pulse"></span>
                    Live updates enabled
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {filteredActiveOrders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onPaymentReceived={handlePaymentReceived}
                            />
                        ))}

                        {filteredActiveOrders.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">📋</span>
                                <p>No {statusFilter !== 'all' ? statusFilter.toLowerCase() : 'active'} orders found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Closed Orders Section */}
            <div className="orders-section closed-section">
                <button
                    className="section-toggle"
                    onClick={() => setShowClosed(!showClosed)}
                >
                    <h2 className="section-title">
                        <span className="calendar-icon">📅</span> Closed Orders
                        <span className="section-count">{closedOrders.length}</span>
                    </h2>
                    {showClosed ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {showClosed && (
                    <div className="orders-grid closed-grid">
                        {closedOrders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onPaymentReceived={handlePaymentReceived}
                                isClosed={true}
                            />
                        ))}

                        {closedOrders.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">✅</span>
                                <p>No closed orders</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
