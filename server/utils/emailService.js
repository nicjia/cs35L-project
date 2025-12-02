// This code  generated with the help of Claude AI (APPROXIMATELY 70%)
const nodemailer = require('nodemailer');

/*Email service for sending password reset emails Uses Gmail SMTP with app-specific password*/

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends password reset email with token link
 * Recipient email address
 * Password reset token
 * Result with success status
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Slate Task Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password for your Slate Task Manager account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour.<br>
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendPasswordResetEmail };
