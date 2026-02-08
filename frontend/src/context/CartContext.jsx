import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [tableNumber, setTableNumber] = useState(() => {
        const saved = localStorage.getItem('tableNumber');
        return saved ? parseInt(saved) : null;
    });

    // Edit mode state
    const [editMode, setEditMode] = useState(null); // { orderId, mode: 'edit' | 'add', orderData }

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Save table number to localStorage
    useEffect(() => {
        if (tableNumber) {
            localStorage.setItem('tableNumber', tableNumber.toString());
        }
    }, [tableNumber]);

    const addToCart = (item) => {
        setCartItems((prev) => {
            const existingIndex = prev.findIndex((i) => i._id === item._id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += 1;
                return updated;
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems((prev) =>
            prev.map((item) =>
                item._id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        setEditMode(null);
    };

    const getCartTotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    // Set cart items from existing order (for edit mode)
    const setCartFromOrder = (orderItems) => {
        const formattedItems = orderItems.map(item => ({
            _id: item.menuItem,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));
        setCartItems(formattedItems);
    };

    // Start edit mode
    const startEditMode = (orderId, mode, orderData) => {
        setEditMode({ orderId, mode, orderData });
        if (mode === 'edit') {
            // Pre-populate cart with order items
            setCartFromOrder(orderData.items);
        }
        // For 'add' mode, keep cart empty for adding new items
    };

    // Cancel edit mode
    const cancelEditMode = () => {
        setEditMode(null);
        clearCart();
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                tableNumber,
                setTableNumber,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
                editMode,
                setEditMode,
                startEditMode,
                cancelEditMode,
                setCartFromOrder
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
