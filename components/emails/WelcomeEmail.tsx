import React from 'react';

interface WelcomeEmailProps {
  firstName: string;
  email: string;
  temporaryPassword: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  firstName,
  email,
  temporaryPassword,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ color: '#2196f3', fontSize: '24px', marginBottom: '20px' }}>
      Welcome to Timewise HRMS, {firstName}!
    </div>
    
    <p>Your account has been created with the following credentials:</p>
    
    <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
      <strong>Email:</strong> {email}<br />
      <strong>Temporary Password:</strong> {temporaryPassword}
    </div>
    
    <p><strong>For security reasons, you will be required to change your password upon first login.</strong></p>
    
    <p style={{ color: '#f44336' }}>Please do not share these credentials with anyone.</p>
    
    <p>
      Best regards,<br />
      Timewise HRMS Team
    </p>
  </div>
);
