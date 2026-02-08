import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tablesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUsers, FiCheck, FiX, FiUnlock, FiEdit2 } from 'react-icons/fi';
import './AdminTables.css';

const AdminTables = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newTotalTables, setNewTotalTables] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await tablesAPI.getAll();
            if (response.data.success) {
                setTables(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch tables');
        } finally {
            setLoading(false);
        }
    };

    const toggleTableActive = async (tableId, currentStatus) => {
        try {
            await tablesAPI.updateStatus(tableId, { isActive: !currentStatus });
            toast.success(`Table ${currentStatus ? 'disabled' : 'enabled'}`);
            fetchTables();
        } catch (error) {
            toast.error('Failed to update table');
        }
    };

    const freeTable = async (tableId) => {
        try {
            await tablesAPI.freeTable(tableId);
            toast.success('Table freed successfully');
            fetchTables();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to free table');
        }
    };

    const openEditModal = () => {
        setNewTotalTables(tables.length.toString());
        setShowEditModal(true);
    };

    const handleSaveTotalTables = async () => {
        const total = parseInt(newTotalTables);
        if (!total || total < 1 || total > 100) {
            toast.error('Please enter a number between 1 and 100');
            return;
        }

        setSaving(true);
        try {
            const response = await tablesAPI.setTotalTables(total);
            if (response.data.success) {
                toast.success(response.data.message);
                setShowEditModal(false);
                fetchTables();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update total tables');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="admin-tables-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    const activeTables = tables.filter(t => t.isActive);
    const inactiveTables = tables.filter(t => !t.isActive);
    const occupiedCount = tables.filter(t => t.isOccupied).length;
    const availableCount = tables.filter(t => t.isActive && !t.isOccupied).length;

    return (
        <div className="admin-tables-page">
            <div className="tables-container">
                <div className="tables-header">
                    <button className="back-btn" onClick={() => navigate('/admin')}>
                        <FiArrowLeft /> Back to Dashboard
                    </button>
                    <h1><FiUsers /> Table Management</h1>
                </div>

                <div className="tables-stats">
                    <div className="stat-card total" onClick={openEditModal}>
                        <span className="stat-value">{tables.length}</span>
                        <span className="stat-label">Total Tables</span>
                        <button className="edit-total-btn">
                            <FiEdit2 /> Edit
                        </button>
                    </div>
                    <div className="stat-card available">
                        <span className="stat-value">{availableCount}</span>
                        <span className="stat-label">Available</span>
                    </div>
                    <div className="stat-card occupied">
                        <span className="stat-value">{occupiedCount}</span>
                        <span className="stat-label">Occupied</span>
                    </div>
                    <div className="stat-card inactive">
                        <span className="stat-value">{inactiveTables.length}</span>
                        <span className="stat-label">Disabled</span>
                    </div>
                </div>

                <div className="tables-section">
                    <h2>Active Tables ({activeTables.length})</h2>
                    <div className="tables-grid">
                        {activeTables.map((table) => (
                            <div
                                key={table._id}
                                className={`table-card ${table.isOccupied ? 'occupied' : 'available'}`}
                            >
                                <div className="table-number">Table {table.tableNumber}</div>
                                <div className={`table-status ${table.isOccupied ? 'occupied' : 'available'}`}>
                                    {table.isOccupied ? '🔴 Occupied' : '🟢 Available'}
                                </div>
                                <div className="table-actions">
                                    {table.isOccupied && (
                                        <button
                                            className="action-btn free"
                                            onClick={() => freeTable(table._id)}
                                            title="Free this table"
                                        >
                                            <FiUnlock /> Free
                                        </button>
                                    )}
                                    <button
                                        className="action-btn disable"
                                        onClick={() => toggleTableActive(table._id, table.isActive)}
                                        title="Disable this table"
                                    >
                                        <FiX /> Disable
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {inactiveTables.length > 0 && (
                    <div className="tables-section disabled-section">
                        <h2>Disabled Tables ({inactiveTables.length})</h2>
                        <div className="tables-grid">
                            {inactiveTables.map((table) => (
                                <div key={table._id} className="table-card disabled">
                                    <div className="table-number">Table {table.tableNumber}</div>
                                    <div className="table-status disabled">⚫ Disabled</div>
                                    <div className="table-actions">
                                        <button
                                            className="action-btn enable"
                                            onClick={() => toggleTableActive(table._id, table.isActive)}
                                            title="Enable this table"
                                        >
                                            <FiCheck /> Enable
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Total Tables Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Total Tables</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-info">
                                Current tables: <strong>{tables.length}</strong>
                            </p>
                            <div className="form-group">
                                <label>New Total Tables (1-100)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={newTotalTables}
                                    onChange={(e) => setNewTotalTables(e.target.value)}
                                    placeholder="Enter number of tables"
                                />
                            </div>
                            <p className="modal-warning">
                                ⚠️ Reducing tables will remove the highest numbered tables first.
                                Occupied tables cannot be removed.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                onClick={handleSaveTotalTables}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTables;
