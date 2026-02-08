import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiX, FiUsers } from 'react-icons/fi';
import './AdminDashboard.css';

const categories = ['Starters', 'Main Course', 'Drinks', 'Desserts'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Starters',
        price: '',
        image: '',
        available: true
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchMenu();
        }
    }, [user]);

    const fetchMenu = async () => {
        try {
            const response = await menuAPI.getAll();
            setMenuItems(response.data.data);
        } catch (error) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingItem) {
                await menuAPI.update(editingItem._id, data);
                toast.success('Menu item updated');
            } else {
                await menuAPI.create(data);
                toast.success('Menu item added');
            }

            fetchMenu();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            await menuAPI.delete(id);
            toast.success('Menu item deleted');
            fetchMenu();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            category: 'Starters',
            price: '',
            image: '',
            available: true
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            category: item.category,
            price: item.price.toString(),
            image: item.image || '',
            available: item.available
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    if (authLoading) {
        return <div className="admin-loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="header-left">
                    <h1>Menu Management</h1>
                    <p>Add, edit, or remove menu items</p>
                </div>
                <div className="header-actions">
                    <button className="tables-btn" onClick={() => navigate('/admin/tables')}>
                        <FiUsers /> Tables
                    </button>
                    <button className="orders-btn" onClick={() => navigate('/admin/orders')}>
                        <FiPackage /> Orders
                    </button>
                    <button className="add-btn" onClick={openAddModal}>
                        <FiPlus /> Add Item
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="menu-table-container">
                    <table className="menu-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Available</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="item-name-cell">
                                            <span className="item-emoji">🍽️</span>
                                            <div>
                                                <strong>{item.name}</strong>
                                                <p>{item.description?.substring(0, 50)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{item.category}</span>
                                    </td>
                                    <td className="price-cell">₹{item.price}</td>
                                    <td>
                                        <span className={`status-dot ${item.available ? 'available' : 'unavailable'}`}></span>
                                        {item.available ? 'Yes' : 'No'}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="edit-btn" onClick={() => openEditModal(item)}>
                                                <FiEdit2 />
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {menuItems.length === 0 && (
                        <div className="empty-state">
                            <p>No menu items yet. Add your first item!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="available"
                                    name="available"
                                    checked={formData.available}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="available">Available for ordering</label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
