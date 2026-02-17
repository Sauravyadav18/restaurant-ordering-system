import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiKey } from 'react-icons/fi';
import './ChangePassword.css';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('change'); // 'change' or 'forgot'

    // Change Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changeLoading, setChangeLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Forgot Password state
    const [forgotStep, setForgotStep] = useState(1); // 1: enter mobile, 2: enter OTP + new password
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [forgotNewPassword, setForgotNewPassword] = useState('');
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [showForgotNewPwd, setShowForgotNewPwd] = useState(false);
    const [showForgotConfirmPwd, setShowForgotConfirmPwd] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    useEffect(() => {
        if (!authLoading && !user && activeTab === 'change') {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate, activeTab]);

    // OTP countdown timer
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [otpTimer]);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setChangeLoading(true);
        try {
            const response = await authAPI.changePassword(oldPassword, newPassword, confirmPassword);
            toast.success(response.data.message || 'Password changed successfully!');
            // Log out and redirect to login
            setTimeout(() => {
                logout();
                navigate('/admin/login');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setChangeLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!mobile.trim()) {
            return toast.error('Please enter your mobile number');
        }

        setForgotLoading(true);
        try {
            const response = await authAPI.sendResetOtp(mobile);
            toast.success(response.data.message || 'OTP sent to your email!');
            setMaskedEmail(response.data.maskedEmail || '');
            setForgotStep(2);
            setOtpTimer(300); // 5 minutes
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            return toast.error('Please enter the OTP');
        }
        if (forgotNewPassword.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }
        if (forgotNewPassword !== forgotConfirmPassword) {
            return toast.error('Passwords do not match');
        }

        setForgotLoading(true);
        try {
            const response = await authAPI.verifyResetOtp(mobile, otp, forgotNewPassword, forgotConfirmPassword);
            toast.success(response.data.message || 'Password reset successfully!');
            setTimeout(() => {
                if (user) logout();
                navigate('/admin/login');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setForgotLoading(false);
        }
    };

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const resetForgotForm = () => {
        setForgotStep(1);
        setMobile('');
        setOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setMaskedEmail('');
        setOtpTimer(0);
    };

    return (
        <div className="change-password-page">
            <div className="cp-container">
                <button className="cp-back-btn" onClick={() => navigate('/admin')}>
                    <FiArrowLeft /> Back to Dashboard
                </button>

                <div className="cp-header">
                    <div className="cp-icon">
                        <FiShield />
                    </div>
                    <h1>Security Settings</h1>
                    <p>Manage your account password</p>
                </div>

                {/* Tabs */}
                <div className="cp-tabs">
                    <button
                        className={`cp-tab ${activeTab === 'change' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('change'); resetForgotForm(); }}
                    >
                        <FiKey /> Change Password
                    </button>
                    <button
                        className={`cp-tab ${activeTab === 'forgot' ? 'active' : ''}`}
                        onClick={() => setActiveTab('forgot')}
                    >
                        <FiMail /> Forgot Password
                    </button>
                </div>

                {/* Change Password Tab */}
                {activeTab === 'change' && (
                    <div className="cp-card">
                        <div className="cp-card-header">
                            <h2><FiLock /> Change Password</h2>
                            <p>Enter your current password and choose a new one</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="cp-form">
                            <div className="cp-form-group">
                                <label>Old Password</label>
                                <div className="cp-input-wrapper">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="cp-eye-btn"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        {showOldPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="cp-form-group">
                                <label>New Password</label>
                                <div className="cp-input-wrapper">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="cp-eye-btn"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && newPassword.length < 6 && (
                                    <span className="cp-hint error">Password must be at least 6 characters</span>
                                )}
                            </div>

                            <div className="cp-form-group">
                                <label>Confirm New Password</label>
                                <div className="cp-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="cp-eye-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                                    <span className="cp-hint error">Passwords do not match</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="cp-submit-btn"
                                disabled={changeLoading || !oldPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                            >
                                {changeLoading ? (
                                    <><span className="cp-spinner"></span> Changing...</>
                                ) : (
                                    <><FiLock /> Update Password</>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Forgot Password Tab */}
                {activeTab === 'forgot' && (
                    <div className="cp-card">
                        {/* Step Indicator */}
                        <div className="cp-steps">
                            <div className={`cp-step ${forgotStep >= 1 ? 'active' : ''}`}>
                                <div className="step-number">1</div>
                                <span>Enter Mobile</span>
                            </div>
                            <div className="step-line"></div>
                            <div className={`cp-step ${forgotStep >= 2 ? 'active' : ''}`}>
                                <div className="step-number">2</div>
                                <span>Verify & Reset</span>
                            </div>
                        </div>

                        {/* Step 1: Enter Mobile */}
                        {forgotStep === 1 && (
                            <>
                                <div className="cp-card-header">
                                    <h2><FiMail /> Forgot Password</h2>
                                    <p>Enter your registered mobile number to receive an OTP via email</p>
                                </div>
                                <form onSubmit={handleSendOtp} className="cp-form">
                                    <div className="cp-form-group">
                                        <label>Mobile Number (User ID)</label>
                                        <input
                                            type="text"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="Enter registered mobile number"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="cp-submit-btn otp"
                                        disabled={forgotLoading || !mobile.trim()}
                                    >
                                        {forgotLoading ? (
                                            <><span className="cp-spinner"></span> Sending OTP...</>
                                        ) : (
                                            <><FiMail /> Send OTP to Email</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Step 2: Verify OTP + Reset Password */}
                        {forgotStep === 2 && (
                            <>
                                <div className="cp-card-header">
                                    <h2><FiShield /> Verify OTP</h2>
                                    <p>
                                        OTP sent to <strong>{maskedEmail}</strong>
                                        {otpTimer > 0 && (
                                            <span className="cp-timer"> — Expires in {formatTimer(otpTimer)}</span>
                                        )}
                                    </p>
                                </div>
                                <form onSubmit={handleVerifyOtp} className="cp-form">
                                    <div className="cp-form-group">
                                        <label>Enter 6-Digit OTP</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Enter OTP"
                                            required
                                            maxLength={6}
                                            className="otp-input"
                                        />
                                    </div>

                                    <div className="cp-form-group">
                                        <label>New Password</label>
                                        <div className="cp-input-wrapper">
                                            <input
                                                type={showForgotNewPwd ? 'text' : 'password'}
                                                value={forgotNewPassword}
                                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                                placeholder="Enter new password (min 6 characters)"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                className="cp-eye-btn"
                                                onClick={() => setShowForgotNewPwd(!showForgotNewPwd)}
                                            >
                                                {showForgotNewPwd ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cp-form-group">
                                        <label>Confirm New Password</label>
                                        <div className="cp-input-wrapper">
                                            <input
                                                type={showForgotConfirmPwd ? 'text' : 'password'}
                                                value={forgotConfirmPassword}
                                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                className="cp-eye-btn"
                                                onClick={() => setShowForgotConfirmPwd(!showForgotConfirmPwd)}
                                            >
                                                {showForgotConfirmPwd ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                        {forgotConfirmPassword.length > 0 && forgotConfirmPassword !== forgotNewPassword && (
                                            <span className="cp-hint error">Passwords do not match</span>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="cp-submit-btn reset"
                                        disabled={forgotLoading || otp.length !== 6 || forgotNewPassword.length < 6 || forgotNewPassword !== forgotConfirmPassword}
                                    >
                                        {forgotLoading ? (
                                            <><span className="cp-spinner"></span> Resetting...</>
                                        ) : (
                                            <><FiShield /> Reset Password</>
                                        )}
                                    </button>

                                    <div className="cp-otp-actions">
                                        <button
                                            type="button"
                                            className="cp-resend-btn"
                                            onClick={() => { resetForgotForm(); }}
                                        >
                                            ← Back to Step 1
                                        </button>
                                        {otpTimer === 0 && (
                                            <button
                                                type="button"
                                                className="cp-resend-btn"
                                                onClick={handleSendOtp}
                                                disabled={forgotLoading}
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;
