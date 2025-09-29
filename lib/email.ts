import { Resend } from 'resend';
import { logger } from './logger';
import { ReactElement } from 'react';

interface EmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({ to, subject, react }: EmailOptions) {
  try {
    if (!resend || !resendApiKey) {
      // In development or when email is not configured, just log and return success
      if (process.env.NODE_ENV === 'development') {
        logger.info('Email service not configured in development mode', { to, subject });
        return { success: true, messageId: 'dev-mode-skip' };
      }
      
      logger.warn('Email service not configured - RESEND_API_KEY missing', { to, subject });
      return { success: false, error: 'Email service not configured' };
    }

    logger.info('Sending email', { to, subject });

    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Timewise HRMS'} <${process.env.RESEND_FROM_EMAIL || 'noreply@timewise.com'}>`,
      to,
      subject,
      react,
    });

    if (error) {
      throw error;
    }

    logger.info('Email sent successfully', {
      id: data?.id,
      to,
      subject,
    });

    return { success: true, messageId: data?.id };
  } catch (error) {
    logger.error('Failed to send email', { error, to, subject });
    throw error;
  }
}
