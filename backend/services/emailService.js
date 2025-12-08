const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD in .env file');
  }

  // For development, use Gmail or other SMTP service
  // For production, consider using services like SendGrid, Mailgun, or AWS SES
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Add connection timeout and retry options
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // For Gmail, we might need to allow less secure apps or use OAuth2
    // For now, using app password is recommended
  });

  return transporter;
};

/**
 * Send booking confirmation email
 * @param {string} userEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {Object} bookingData - Booking information
 * @param {Object} mountainData - Mountain information
 */
const sendBookingConfirmation = async (userEmail, userName, bookingData, mountainData) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️  Email not configured. Skipping email notification.');
      console.log('💡 To enable emails, set SMTP_USER and SMTP_PASSWORD in .env');
      console.log('💡 For Gmail, use App Password (not regular password)');
      console.log('💡 Generate App Password at: https://myaccount.google.com/apppasswords');
      return { success: false, message: 'Email not configured' };
    }

    console.log('📧 Attempting to send booking confirmation email to:', userEmail);
    console.log('📧 Using SMTP host:', process.env.SMTP_HOST || 'smtp.gmail.com');

    const transporter = createTransporter();

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP server verification failed:', verifyError.message);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    // Format booking date(s) - handle date range
    const startDate = bookingData.start_date || bookingData.booking_date;
    const endDate = bookingData.end_date || bookingData.booking_date;
    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);
    
    const formattedStartDate = bookingStartDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const formattedEndDate = bookingEndDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Format date range for display
    const formattedDate = startDate === endDate 
      ? formattedStartDate 
      : `${formattedStartDate} - ${formattedEndDate}`;

    // Calculate days until booking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((bookingStartDate - today) / (1000 * 60 * 60 * 24));
    
    // Format time (if available)
    const formattedTime = bookingStartDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Format number of participants
    const numberOfParticipants = bookingData.number_of_participants ? parseInt(bookingData.number_of_participants) : 1;
    const participantsText = `${numberOfParticipants} ${numberOfParticipants === 1 ? 'person' : 'people'}`;
    
    // Format booking type
    const bookingType = bookingData.booking_type || 'joiner';
    const bookingTypeText = bookingType === 'exclusive' ? 'Exclusive Hike (Private Group)' : 'Joiner (Shared Group Hike)';
    
    // Format total amount
    const totalAmount = bookingData.total_price ? parseFloat(bookingData.total_price).toFixed(2) : '0.00';
    const formattedAmount = `₱${parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Email content
    const mailOptions = {
      from: `"Poorito Team" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${mountainData.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f9fafb;
              padding: 0;
              margin: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .email-header {
              background-color: #f97316;
              padding: 48px 32px;
              text-align: center;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 8px;
              letter-spacing: 1.5px;
            }
            .header-title {
              font-size: 26px;
              font-weight: 700;
              color: #ffffff;
              margin: 12px 0 8px 0;
            }
            .header-subtitle {
              font-size: 15px;
              color: rgba(255,255,255,0.9);
              margin-top: 4px;
              font-weight: 400;
            }
            .email-body {
              padding: 48px 32px;
              background-color: #ffffff;
            }
            .greeting {
              font-size: 17px;
              color: #1f2937;
              margin-bottom: 16px;
              font-weight: 500;
            }
            .intro-text {
              font-size: 15px;
              color: #4b5563;
              margin-bottom: 36px;
              line-height: 1.7;
            }
            .info-card {
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 28px;
              margin: 36px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .info-card-title {
              font-size: 17px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 24px;
              padding-bottom: 12px;
              border-bottom: 2px solid #f97316;
              letter-spacing: -0.01em;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 16px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .info-row:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .info-label {
              font-size: 11px;
              color: #6b7280;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              flex: 0 0 140px;
            }
            .info-value {
              font-size: 15px;
              color: #111827;
              font-weight: 600;
              text-align: right;
              flex: 1;
              line-height: 1.5;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              background-color: #10b981;
              color: #ffffff;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .mountain-card {
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 28px;
              margin: 36px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .mountain-header {
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 1px solid #f3f4f6;
            }
            .mountain-name {
              font-size: 20px;
              font-weight: 700;
              color: #111827;
              margin: 0;
              letter-spacing: -0.01em;
            }
            .mountain-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .mountain-detail-item {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .mountain-detail-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              font-weight: 600;
            }
            .mountain-detail-value {
              font-size: 15px;
              color: #111827;
              font-weight: 600;
              line-height: 1.5;
            }
            .difficulty-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
            }
            .difficulty-easy { background-color: #d1fae5; color: #065f46; }
            .difficulty-moderate { background-color: #fef3c7; color: #92400e; }
            .difficulty-hard { background-color: #fee2e2; color: #991b1b; }
            .difficulty-expert { background-color: #fce7f3; color: #831843; }
            .cta-section {
              text-align: center;
              margin: 40px 0 30px 0;
              padding: 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 28px;
              background-color: #f97316;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              box-shadow: none;
              transition: all 0.2s ease;
              border: none;
            }
            .cta-button:hover {
              background-color: #ea580c;
            }
            .divider {
              height: 1px;
              background-color: #e5e7eb;
              margin: 36px 0;
              border: none;
            }
            .footer {
              background-color: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 10px;
              line-height: 1.6;
            }
            .footer-signature {
              font-size: 15px;
              color: #333333;
              font-weight: 600;
              margin-top: 15px;
            }
            .footer-note {
              font-size: 12px;
              color: #9ca3af;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
            }
            .countdown {
              background-color: #fff7ed;
              border: 1px solid #fed7aa;
              border-radius: 8px;
              padding: 16px 24px;
              margin: 32px 0;
              text-align: center;
            }
            .countdown-text {
              font-size: 14px;
              color: #9a3412;
              font-weight: 600;
              letter-spacing: 0.02em;
            }
            @media only screen and (max-width: 600px) {
              .email-wrapper {
                width: 100% !important;
              }
              .email-body {
                padding: 32px 24px;
              }
              .email-header {
                padding: 36px 24px;
              }
              .header-title {
                font-size: 22px;
              }
              .logo {
                font-size: 24px;
              }
              .info-card,
              .mountain-card {
                padding: 24px;
                margin: 28px 0;
              }
              .info-card-title,
              .mountain-name {
                font-size: 16px;
              }
              .mountain-details {
                grid-template-columns: 1fr;
                gap: 16px;
              }
              .info-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
                padding: 14px 0;
              }
              .info-label {
                flex: none;
                margin-bottom: 4px;
              }
              .info-value {
                text-align: left;
                flex: none;
                width: 100%;
              }
              .cta-button {
                padding: 12px 24px;
                font-size: 14px;
                width: 100%;
                max-width: 280px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header -->
            <div class="email-header">
              <div class="logo">POORITO</div>
              <h1 class="header-title">Booking Confirmed!</h1>
              <p class="header-subtitle">Your mountain adventure awaits</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
              <p class="greeting">Hello ${userName},</p>
              
              <p class="intro-text">
                Great news! Your booking request has been confirmed by our admin team. Your reservation is now official and you're all set for an amazing adventure.
              </p>
              
              ${daysUntil > 0 ? `
              <div class="countdown">
                <p class="countdown-text">${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} until your adventure!</p>
              </div>
              ` : ''}
              
              <!-- Booking Details Card -->
              <div class="info-card">
                <h2 class="info-card-title">
                  Booking Details
                </h2>
                <div class="info-row">
                  <span class="info-label">Booking ID</span>
                  <span class="info-value">POOR-${String(bookingData.id).padStart(6, '0')}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Booking Date</span>
                  <span class="info-value">${formattedDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status</span>
                  <span class="info-value"><span class="status-badge">${bookingData.status.toUpperCase()}</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Number of Participants (Pax)</span>
                  <span class="info-value">${participantsText}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Booking Type</span>
                  <span class="info-value">${bookingTypeText}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Amount</span>
                  <span class="info-value" style="font-size: 16px; color: #f97316; font-weight: 700;">${formattedAmount}</span>
                </div>
              </div>
              
              <!-- Mountain Information Card -->
              <div class="mountain-card">
                <div class="mountain-header">
                  <h2 class="mountain-name">${mountainData.name}</h2>
                </div>
                <div class="mountain-details">
                  ${mountainData.location ? `
                  <div class="mountain-detail-item">
                    <span class="mountain-detail-label">Location</span>
                    <span class="mountain-detail-value">${mountainData.location}</span>
                  </div>
                  ` : ''}
                  ${mountainData.difficulty ? `
                  <div class="mountain-detail-item">
                    <span class="mountain-detail-label">Difficulty</span>
                    <span class="mountain-detail-value">
                      <span class="difficulty-badge difficulty-${mountainData.difficulty.toLowerCase()}">${mountainData.difficulty}</span>
                    </span>
                  </div>
                  ` : ''}
                  ${mountainData.elevation ? `
                  <div class="mountain-detail-item">
                    <span class="mountain-detail-label">Elevation</span>
                    <span class="mountain-detail-value">${mountainData.elevation.toLocaleString()} MASL</span>
                  </div>
                  ` : ''}
                  <div class="mountain-detail-item">
                    <span class="mountain-detail-label">Pax</span>
                    <span class="mountain-detail-value">${participantsText}</span>
                  </div>
                  <div class="mountain-detail-item">
                    <span class="mountain-detail-label">Booking Type</span>
                    <span class="mountain-detail-value">${bookingTypeText}</span>
                  </div>
                  <div class="mountain-detail-item">
                    <span class="mountain-detail-label">Total Amount</span>
                    <span class="mountain-detail-value" style="color: #f97316; font-weight: 700;">${formattedAmount}</span>
                  </div>
                </div>
              </div>
              
              <p class="intro-text" style="margin-top: 30px;">
                <strong>Important Reminders:</strong><br>
                • Please arrive on time for your scheduled hike<br>
                • Bring all necessary equipment and supplies as recommended<br>
                • If you need to cancel or make changes, please contact us as soon as possible<br>
                • For any questions or concerns, feel free to reach out to us
              </p>
              
              <div class="divider"></div>
              
              <!-- Call to Action -->
              <div class="cta-section">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
                  View My Bookings
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-signature">Best regards,<br>The Poorito Team</p>
              <p class="footer-text">
                We're here to make your mountain adventure unforgettable. Safe travels!
              </p>
              <p class="footer-note">
                This is an automated confirmation email. Please do not reply to this message.<br>
                If you need assistance, please visit our website or contact our support team.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        POORITO - Booking Confirmed!
        
        Hello ${userName},
        
        Great news! Your booking request has been confirmed by our admin team. Your reservation is now official and you're all set for an amazing adventure.
        
        ${daysUntil > 0 ? `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} until your adventure!\n\n` : ''}
        
        BOOKING DETAILS
        ──────────────────────────────────────
        Booking ID: POOR-${String(bookingData.id).padStart(6, '0')}
        Booking Date: ${formattedDate}
        Status: ${bookingData.status.toUpperCase()}
        Number of Participants (Pax): ${participantsText}
        Booking Type: ${bookingTypeText}
        Total Amount: ${formattedAmount}
        
        MOUNTAIN INFORMATION
        ──────────────────────────────────────
        Name: ${mountainData.name}
        ${mountainData.location ? `Location: ${mountainData.location}\n` : ''}${mountainData.difficulty ? `Difficulty: ${mountainData.difficulty}\n` : ''}${mountainData.elevation ? `Elevation: ${mountainData.elevation.toLocaleString()} MASL\n` : ''}Pax: ${participantsText}

        IMPORTANT REMINDERS:
        • Please arrive on time for your scheduled hike
        • Bring all necessary equipment and supplies as recommended
        • If you need to cancel or make changes, please contact us as soon as possible
        • For any questions or concerns, feel free to reach out to us
        
        View your bookings: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard
        
        ──────────────────────────────────────
        Best regards,
        The Poorito Team
        
        We're here to make your mountain adventure unforgettable. Safe travels!
        
        This is an automated confirmation email. Please do not reply to this message.
        If you need assistance, please visit our website or contact our support team.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('💡 Authentication failed. Check your SMTP_USER and SMTP_PASSWORD');
      console.error('💡 For Gmail, make sure you\'re using an App Password, not your regular password');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('💡 Connection failed. Check your SMTP_HOST and SMTP_PORT settings');
      console.error('💡 Make sure your firewall allows outbound connections on port 587 or 465');
    } else if (error.code === 'EENVELOPE') {
      console.error('💡 Invalid recipient email address');
    }
    
    // Don't throw error - email failure shouldn't break booking creation
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Send password reset email
 * @param {string} userEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {string} resetLink - Password reset link
 */
const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️  Email not configured. Skipping password reset email.');
      console.log('💡 To enable emails, set SMTP_USER and SMTP_PASSWORD in .env');
      console.log('💡 For Gmail, use App Password (not regular password)');
      console.log('💡 Generate App Password at: https://myaccount.google.com/apppasswords');
      return { success: false, message: 'Email not configured' };
    }

    console.log('📧 Attempting to send password reset email to:', userEmail);
    console.log('📧 Using SMTP host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('📧 Using SMTP user:', process.env.SMTP_USER);

    const transporter = createTransporter();

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP server verification failed:', verifyError.message);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    const mailOptions = {
      from: `"Poorito Team" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f9fafb;
              padding: 0;
              margin: 0;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .email-header {
              background-color: #f97316;
              padding: 48px 32px;
              text-align: center;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 8px;
              letter-spacing: 1.5px;
            }
            .header-title {
              font-size: 26px;
              font-weight: 700;
              color: #ffffff;
              margin: 12px 0 8px 0;
            }
            .email-body {
              padding: 48px 32px;
              background-color: #ffffff;
            }
            .greeting {
              font-size: 17px;
              color: #1f2937;
              margin-bottom: 16px;
              font-weight: 500;
            }
            .intro-text {
              font-size: 15px;
              color: #4b5563;
              margin-bottom: 24px;
              line-height: 1.7;
            }
            .reset-button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #f97316;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-size: 15px;
              font-weight: 600;
              margin: 24px 0;
              box-shadow: 0 2px 4px rgba(249,115,22,0.2);
            }
            .reset-link {
              word-break: break-all;
              color: #6b7280;
              font-size: 13px;
              margin-top: 16px;
              padding: 12px;
              background-color: #f9fafb;
              border-radius: 6px;
            }
            .warning-text {
              font-size: 13px;
              color: #6b7280;
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
            }
            .footer {
              background-color: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 10px;
              line-height: 1.6;
            }
            @media only screen and (max-width: 600px) {
              .email-body {
                padding: 32px 24px;
              }
              .email-header {
                padding: 36px 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-header">
              <div class="logo">POORITO</div>
              <h1 class="header-title">Reset Your Password</h1>
            </div>
            
            <div class="email-body">
              <p class="greeting">Hello ${userName},</p>
              
              <p class="intro-text">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Reset Password</a>
              </div>
              
              <div class="reset-link">
                <strong>Or copy and paste this link:</strong><br>
                ${resetLink}
              </div>
              
              <p class="warning-text">
                <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                Best regards,<br>
                The Poorito Team
              </p>
              <p class="footer-text" style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - Poorito
        
        Hello ${userName},
        
        We received a request to reset your password. Click the link below to create a new password:
        
        ${resetLink}
        
        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        
        Best regards,
        The Poorito Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('💡 Authentication failed. Check your SMTP_USER and SMTP_PASSWORD');
      console.error('💡 For Gmail, make sure you\'re using an App Password, not your regular password');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('💡 Connection failed. Check your SMTP_HOST and SMTP_PORT settings');
      console.error('💡 Make sure your firewall allows outbound connections on port 587 or 465');
    } else if (error.code === 'EENVELOPE') {
      console.error('💡 Invalid recipient email address');
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPasswordResetEmail,
};

