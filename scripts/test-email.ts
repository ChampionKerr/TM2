import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Timewise HRMS <onboarding@resend.dev>',
            to: 'skerr1984@yahoo.com',
            subject: 'Test Email',
            html: '<p>This is a test email from Timewise HRMS</p>'
        });

        if (error) {
            console.error('Error sending email:', error);
            return;
        }

        console.log('Email sent successfully:', data);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

main();
