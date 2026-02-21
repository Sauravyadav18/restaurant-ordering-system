const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail App Password
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        family: 4
    });
};

/**
 * Build the HTML email content for OTP
 */
const buildOtpHtml = (otp) => `
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
</div>`;

/**
 * Send OTP email using Brevo HTTP API (works on Render and all platforms)
 * Falls back to Nodemailer SMTP if Brevo key is not configured
 */
const sendOtpEmail = async (email, otp) => {
    const htmlContent = buildOtpHtml(otp);

    // Method 1: Brevo HTTP API (recommended for Render)
    if (process.env.BREVO_API_KEY) {
        console.log('[Email] Sending via Brevo HTTP API...');
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'Restaurant Admin', email: process.env.EMAIL_USER },
                to: [{ email: email }],
                subject: '🔐 Password Reset OTP - Restaurant Admin',
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Brevo API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        console.log('[Email] Sent successfully via Brevo');
        return;
    }

    // Method 2: Nodemailer SMTP (works locally, may not work on some cloud hosts)
    console.log('[Email] Sending via Gmail SMTP...');
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Restaurant Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Password Reset OTP - Restaurant Admin',
        html: htmlContent
    });

    console.log('[Email] Sent successfully via Gmail SMTP');
};

module.exports = { sendOtpEmail };
