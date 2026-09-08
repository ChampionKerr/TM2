import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { logger } from '@/lib/logger';
import React from 'react';

export async function GET(request: NextRequest) {
    try {
        logger.apiRequest(request, 200, {
            endpoint: '/api/test-email',
            method: 'GET',
            action: 'test_email_initiated'
        });

        await sendEmail({
            to: 'skerr1984@gmail.com',
            subject: 'Test Email - Timewise HRMS',
            react: React.createElement(WelcomeEmail, {
                firstName: 'Stephen',
                email: 'skerr1984@gmail.com',
                temporaryPassword: 'TestPassword123!'
            })
        });

        logger.securityEvent('test_email_sent', {
            endpoint: '/api/test-email',
            recipient: 'skerr1984@gmail.com'
        });

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully'
        });
    } catch (error) {
        logger.apiRequest(request, 500, {
            endpoint: '/api/test-email',
            method: 'GET',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        logger.securityEvent('test_email_error', {
            endpoint: '/api/test-email',
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send test email'
        }, { status: 500 });
    }
}
