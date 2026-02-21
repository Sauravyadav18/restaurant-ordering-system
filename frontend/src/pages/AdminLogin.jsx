import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPhone, FiLock, FiLogIn } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in (using useEffect to avoid blank screen)
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/admin', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mobile || !password) {
            toast.error('Please enter mobile number and password');
            return;
        }

        setLoading(true);

        try {
            await login(mobile, password);
            toast.success('Login successful!');
            navigate('/admin', { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="admin-login-page">
                <div className="login-container">
                    <div className="login-loading">
                        <div className="loader"></div>
                        <p>Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render login form if user is authenticated (redirect will happen via useEffect)
    if (user) {
        return (
            <div className="admin-login-page">
                <div className="login-container">
                    <div className="login-loading">
                        <div className="loader"></div>
                        <p>Redirecting to dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-icon">🔐</div>
                    <h1>Admin Login</h1>
                    <p>Access the restaurant management dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="mobile">
                            <FiPhone /> Mobile Number
                        </label>
                        <input
                            type="tel"
                            id="mobile"
                            placeholder="Enter your mobile number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            maxLength={10}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <FiLock /> Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            'Logging in...'
                        ) : (
                            <>
                                <FiLogIn /> Login
                            </>
                        )}
                    </button>
                </form>

                <div className="login-forgot">
                    <Link to="/admin/change-password?tab=forgot" className="forgot-link">
                        <FiLock /> Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
