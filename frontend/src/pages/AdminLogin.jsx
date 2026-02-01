import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPhone, FiLock, FiLogIn } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    if (user) {
        navigate('/admin');
        return null;
    }

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
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

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

                <div className="login-hint">
                    <p>Demo credentials:</p>
                    <code>Mobile: 7078490901 | Password: 490901</code>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
