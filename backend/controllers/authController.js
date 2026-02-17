const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/emailService');

// Login controller
exports.login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Validate input
        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mobile number and password'
            });
        }

        // Find user by mobile
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                mobile: user.mobile,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Verify token controller
exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -resetOTP -otpExpiry -otpAttempts');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Change password using old password (protected route)
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide old password, new password, and confirm password'
            });
        }

        // Check new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Check passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify old password
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        // Check new password is different from old
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from old password'
            });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Send OTP for password reset
exports.sendResetOtp = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mobile number'
            });
        }

        // Find user
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this mobile number'
            });
        }

        if (!user.email) {
            return res.status(400).json({
                success: false,
                message: 'No email address configured for this account'
            });
        }

        // Rate limit: don't allow new OTP if previous one was sent less than 60 seconds ago
        if (user.otpExpiry && user.resetOTP) {
            const timeSinceOtpCreated = Date.now() - (user.otpExpiry.getTime() - 5 * 60 * 1000);
            if (timeSinceOtpCreated < 60 * 1000) {
                return res.status(429).json({
                    success: false,
                    message: 'Please wait before requesting a new OTP'
                });
            }
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash OTP before storing
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Store hashed OTP with 5 minute expiry
        user.resetOTP = hashedOtp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save({ validateBeforeSave: false });

        // Send OTP via email
        try {
            await sendOtpEmail(user.email, otp);
        } catch (emailError) {
            // Clear OTP if email fails
            user.resetOTP = null;
            user.otpExpiry = null;
            user.otpAttempts = 0;
            await user.save({ validateBeforeSave: false });

            console.error('Email send error:', emailError.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please check email configuration.'
            });
        }

        // Also log OTP to console for development
        console.log(`[OTP] Password reset OTP for ${user.mobile}: ${otp}`);

        // Mask email for response
        const emailParts = user.email.split('@');
        const maskedEmail = emailParts[0].substring(0, 3) + '***@' + emailParts[1];

        res.json({
            success: true,
            message: `OTP sent to ${maskedEmail}`,
            maskedEmail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Verify OTP and reset password
exports.verifyResetOtp = async (req, res) => {
    try {
        const { mobile, otp, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!mobile || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mobile number, OTP, new password, and confirm password'
            });
        }

        // Check password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Check passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        // Find user
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this mobile number'
            });
        }

        // Check if OTP exists
        if (!user.resetOTP || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: 'No OTP request found. Please request a new OTP.'
            });
        }

        // Check max attempts (3)
        if (user.otpAttempts >= 3) {
            // Clear OTP after max attempts
            user.resetOTP = null;
            user.otpExpiry = null;
            user.otpAttempts = 0;
            await user.save({ validateBeforeSave: false });

            return res.status(429).json({
                success: false,
                message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
            });
        }

        // Check OTP expiry
        if (new Date() > user.otpExpiry) {
            // Clear expired OTP
            user.resetOTP = null;
            user.otpExpiry = null;
            user.otpAttempts = 0;
            await user.save({ validateBeforeSave: false });

            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Verify OTP (compare with hashed version)
        const isOtpValid = await bcrypt.compare(otp, user.resetOTP);
        if (!isOtpValid) {
            // Increment attempt counter
            user.otpAttempts += 1;
            await user.save({ validateBeforeSave: false });

            const remaining = 3 - user.otpAttempts;
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
            });
        }

        // OTP is valid — update password
        user.password = newPassword;
        user.resetOTP = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
