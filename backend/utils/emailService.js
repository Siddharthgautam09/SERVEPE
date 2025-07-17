
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendProposalNotificationToClient(clientEmail, clientName, freelancerName, projectTitle, proposalAmount) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: `New Proposal Received for "${projectTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Proposal Received!</h2>
          <p>Hi ${clientName},</p>
          <p>You have received a new proposal for your project "<strong>${projectTitle}</strong>".</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Proposal Details:</h3>
            <p><strong>Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Proposed Amount:</strong> $${proposalAmount}</p>
            <p><strong>Project:</strong> ${projectTitle}</p>
          </div>
          
          <p>Please review the proposal and take action.</p>
          <p>Best regards,<br>Servpe Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Proposal notification email sent to client');
    } catch (error) {
      console.error('Error sending email to client:', error);
    }
  }

  async sendProposalStatusToFreelancer(freelancerEmail, freelancerName, projectTitle, status, clientMessage = '') {
    const statusText = status === 'accepted' ? 'Accepted' : 'Rejected';
    const statusColor = status === 'accepted' ? '#28a745' : '#dc3545';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: freelancerEmail,
      subject: `Proposal ${statusText} for "${projectTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColor};">Proposal ${statusText}!</h2>
          <p>Hi ${freelancerName},</p>
          <p>Your proposal for the project "<strong>${projectTitle}</strong>" has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong>.</p>
          
          ${clientMessage ? `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Client Message:</h3>
              <p>${clientMessage}</p>
            </div>
          ` : ''}
          
          ${status === 'accepted' ? `
            <p style="color: #28a745; font-weight: bold;">Congratulations! You can now start working on this project and communicate with the client through our messaging system.</p>
          ` : `
            <p>Don't worry! Keep looking for other opportunities and keep improving your proposals.</p>
          `}
          
          <p>Best regards,<br>Servpe Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Proposal ${status} email sent to freelancer`);
    } catch (error) {
      console.error('Error sending email to freelancer:', error);
    }
  }
}

module.exports = new EmailService();
