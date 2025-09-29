import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import React from 'react';

export async function GET() {
    try {
        await sendEmail({
            to: 'skerr1984@gmail.com', // Your actual email for testing
            subject: 'Test Email - Timewise HRMS',
            react: React.createElement(WelcomeEmail, {
                firstName: 'Stephen',
                email: 'skerr1984@gmail.com',
                temporaryPassword: 'TestPassword123!'
            })
        });

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully'
        });
    } catch (error: any) {
        console.error('Failed to send test email:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
