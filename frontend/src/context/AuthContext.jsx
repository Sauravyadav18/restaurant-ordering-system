import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.verify();
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        verifyToken();
    }, []);

    const login = async (mobile, password) => {
        const response = await authAPI.login(mobile, password);
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            return response.data;
        }
        throw new Error(response.data.message);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!user && user.role === 'owner';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
