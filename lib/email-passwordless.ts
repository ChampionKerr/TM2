import nodemailer from 'nodemailer';

// Create reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'localhost',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER || '',
      pass: process.env.EMAIL_SERVER_PASSWORD || '',
    },
  } as nodemailer.TransportOptions);
};

export async function sendMagicLinkEmail(email: string, url: string) {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_FROM) {
    console.warn('Email configuration missing, skipping magic link email');
    return;
  }

  const transporter = createTransporter();

  try {
    // Create magic link email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1976d2; margin-bottom: 10px;">TimeWise HRMS</h1>
          <h2 style="color: #333; font-weight: normal;">Sign in to your account</h2>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Click the button below to sign in to your TimeWise HRMS account. This link will expire in 24 hours.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="
            background-color: #1976d2;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">Sign In to TimeWise HRMS</a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you didn't request this email, you can safely ignore it. Someone else might have typed your email address by mistake.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${url}" style="color: #1976d2; word-break: break-all;">${url}</a>
        </p>
      </div>
    `;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@timewise-hrms.com',
      to: email,
      subject: 'Sign in to TimeWise HRMS - Magic Link',
      html: emailHtml,
      text: `Sign in to TimeWise HRMS by clicking this link: ${url}\n\nThis link will expire in 24 hours.`,
    });

    console.log('Magic link email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending magic link email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_FROM) {
    console.warn('Email configuration missing, skipping welcome email');
    return;
  }

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to TimeWise HRMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1976d2;">Welcome to TimeWise HRMS!</h1>
          <p>Hi ${firstName},</p>
          <p>Your account has been created successfully. You can now sign in using:</p>
          <ul>
            <li>Magic link (passwordless) - just enter your email</li>
            <li>Google OAuth - click the Google sign-in button</li>
            <li>Traditional password (if you set one up)</li>
          </ul>
          <p>We're excited to have you on board!</p>
          <p>Best regards,<br>The TimeWise HRMS Team</p>
        </div>
      `,
      text: `Welcome to TimeWise HRMS! Hi ${firstName}, your account has been created successfully.`,
    });

    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}