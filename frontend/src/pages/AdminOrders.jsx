import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { socket, connectSocket, joinAdminRoom } from '../services/socket';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import './AdminOrders.css';

const AdminOrders = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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

            return () => {
                socket.off('new-order');
                socket.off('order-updated');
            };
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
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

    const filteredOrders = orders.filter((order) => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const getOrderCounts = () => {
        return {
            all: orders.length,
            Pending: orders.filter((o) => o.status === 'Pending').length,
            Preparing: orders.filter((o) => o.status === 'Preparing').length,
            Served: orders.filter((o) => o.status === 'Served').length
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
                <button className="refresh-btn" onClick={fetchOrders}>
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All <span className="count">{counts.all}</span>
                </button>
                <button
                    className={`filter-tab pending ${filter === 'Pending' ? 'active' : ''}`}
                    onClick={() => setFilter('Pending')}
                >
                    Pending <span className="count">{counts.Pending}</span>
                </button>
                <button
                    className={`filter-tab preparing ${filter === 'Preparing' ? 'active' : ''}`}
                    onClick={() => setFilter('Preparing')}
                >
                    Preparing <span className="count">{counts.Preparing}</span>
                </button>
                <button
                    className={`filter-tab served ${filter === 'Served' ? 'active' : ''}`}
                    onClick={() => setFilter('Served')}
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
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onStatusChange={handleStatusChange}
                        />
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <p>No {filter !== 'all' ? filter.toLowerCase() : ''} orders found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
