const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail App Password
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email address
 * @param {string} otp - The plain-text OTP to send
 */
const sendOtpEmail = async (email, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Restaurant Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Password Reset OTP - Restaurant Admin',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #ff6b6b, #ee5253); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; color: #fff;">🔐 Password Reset</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Restaurant Admin Panel</p>
                </div>
                <div style="padding: 30px;">
                    <p style="color: #a0aec0; font-size: 14px; margin-bottom: 20px;">
                        You requested a password reset. Use the OTP below to reset your password:
                    </p>
                    <div style="background: rgba(255,255,255,0.05); border: 2px dashed rgba(254,202,87,0.4); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #feca57;">${otp}</span>
                    </div>
                    <p style="color: #a0aec0; font-size: 13px; margin-bottom: 8px;">
                        ⏱️ This OTP expires in <strong style="color: #ff6b6b;">5 minutes</strong>.
                    </p>
                    <p style="color: #a0aec0; font-size: 13px;">
                        🔒 If you did not request this, please ignore this email.
                    </p>
                </div>
                <div style="padding: 15px 30px; background: rgba(255,255,255,0.03); text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="color: #666; font-size: 12px; margin: 0;">Restaurant Ordering System</p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
