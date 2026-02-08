import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { menuAPI, ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import MenuCard from '../components/MenuCard';
import toast from 'react-hot-toast';
import { FiX, FiEdit2, FiPlus, FiShoppingCart } from 'react-icons/fi';
import './Home.css';

const categories = ['All', 'Starters', 'Main Course', 'Drinks', 'Desserts'];

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { editMode, startEditMode, cancelEditMode, getCartCount } = useCart();

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    // Check for edit/add mode from URL params
    useEffect(() => {
        const checkEditMode = async () => {
            const editOrderId = searchParams.get('editOrder');
            const addItemsId = searchParams.get('addItems');

            if (editOrderId && !editMode) {
                try {
                    const response = await ordersAPI.getOne(editOrderId);
                    if (response.data.success) {
                        startEditMode(editOrderId, 'edit', response.data.data);
                        toast.success('Edit mode: Modify your order and go to cart');
                        // Clear the URL param
                        setSearchParams({});
                    }
                } catch (error) {
                    toast.error('Could not load order for editing');
                    setSearchParams({});
                }
            } else if (addItemsId && !editMode) {
                try {
                    const response = await ordersAPI.getOne(addItemsId);
                    if (response.data.success) {
                        startEditMode(addItemsId, 'add', response.data.data);
                        toast.success('Add items mode: Add new items and go to cart');
                        // Clear the URL param
                        setSearchParams({});
                    }
                } catch (error) {
                    toast.error('Could not load order');
                    setSearchParams({});
                }
            }
        };

        checkEditMode();
    }, [searchParams, editMode, startEditMode, setSearchParams]);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const response = await menuAPI.getAll();
            setMenuItems(response.data.data);
        } catch (error) {
            toast.error('Failed to load menu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        cancelEditMode();
        navigate('/order/' + editMode.orderId);
    };

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory);

    const groupedItems = categories.slice(1).reduce((acc, category) => {
        acc[category] = filteredItems.filter((item) => item.category === category);
        return acc;
    }, {});

    return (
        <div className="home-page">
            {/* Edit Mode Banner */}
            {editMode && (
                <div className={`edit-mode-banner ${editMode.mode}`}>
                    <div className="banner-content">
                        <div className="banner-icon">
                            {editMode.mode === 'edit' ? <FiEdit2 /> : <FiPlus />}
                        </div>
                        <div className="banner-text">
                            <strong>
                                {editMode.mode === 'edit' ? 'Editing Order' : 'Adding Items'}
                            </strong>
                            <span>#{editMode.orderId.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="banner-actions">
                        <button className="go-to-cart-btn" onClick={() => navigate('/cart')}>
                            <FiShoppingCart />
                            Go to Cart {getCartCount() > 0 && `(${getCartCount()})`}
                        </button>
                        <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                            <FiX /> Cancel
                        </button>
                    </div>
                </div>
            )}

            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Delicious Food,
                        <span className="highlight"> Delivered Fresh</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore our curated menu of mouth-watering dishes prepared with the finest ingredients
                    </p>
                </div>
                <div className="hero-decoration">
                    <span className="floating-emoji">🍕</span>
                    <span className="floating-emoji">🍔</span>
                    <span className="floating-emoji">🍰</span>
                </div>
            </section>

            <section className="menu-section">
                <div className="category-tabs">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Loading delicious items...</p>
                    </div>
                ) : (
                    <div className="menu-content">
                        {activeCategory === 'All' ? (
                            Object.entries(groupedItems).map(([category, items]) => (
                                items.length > 0 && (
                                    <div key={category} className="category-section">
                                        <h2 className="category-title">{category}</h2>
                                        <div className="menu-grid">
                                            {items.map((item) => (
                                                <MenuCard key={item._id} item={item} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            <div className="menu-grid">
                                {filteredItems.map((item) => (
                                    <MenuCard key={item._id} item={item} />
                                ))}
                            </div>
                        )}

                        {filteredItems.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">🍽️</span>
                                <p>No items found in this category</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
