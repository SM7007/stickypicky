const nodemailer = require('nodemailer');

// Send Password Reset OTP email
const sendResetOtpEmail = async (toEmail, otpCode, userName) => {
  // If SMTP environment variables are configured, send real email
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"stickypicky" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Password Reset Verification Code - stickypicky',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
          <h2 style="color: #111; text-align: center; text-transform: uppercase; letter-spacing: 1px;">stickypicky</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>Hi <strong>${userName || 'Customer'}</strong>,</p>
          <p>We received a request to reset your password. Use the verification code below to complete the reset process:</p>
          <div style="background: #f4f4f5; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111; border-radius: 6px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #666;">This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset OTP sent to ${toEmail}`);
  } else {
    // Development fallback: Log OTP to console
    console.log('\n==================================================');
    console.log(`[DEV OTP EMAIL] To: ${toEmail}`);
    console.log(`[DEV OTP EMAIL] Code: ${otpCode}`);
    console.log('==================================================\n');
  }
};

module.exports = { sendResetOtpEmail };
