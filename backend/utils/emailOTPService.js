
const nodemailer = require('nodemailer');

class EmailOTPService {
  constructor() {
    this.transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        port: 465,
        secure: true, // ✅ implicit SSL (TLS starts immediately)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter configuration error:', error);
      } else {
        console.log('Email service is ready to send messages');
      }
    });
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: {
        name: 'Servpe',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Your Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Servpe</h1>
            <p style="color: #666; margin: 5px 0;">Your Freelance Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0 0 15px 0;">Your Verification Code</h2>
            <div style="background: white; display: inline-block; padding: 15px 25px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 10px 0;">
              ${otp}
            </div>
            <p style="color: white; margin: 15px 0 0 0; font-size: 14px;">This code will expire in 5 minutes</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Security Tips:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>Never share this code with anyone</li>
              <li>We will never ask for your code via phone or email</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This email was sent by Servpe. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: {
        name: 'Servpe',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome to Servpe!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Welcome to Servpe!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0;">Hello ${name}!</h2>
            <p style="margin: 0; font-size: 16px;">Your account has been successfully created. Start exploring amazing opportunities on our platform.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Get Started
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Thank you for choosing Servpe - Your Freelance Platform
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }
}

module.exports = new EmailOTPService();
