import React from 'react';
interface PasswordResetEmailProps {
    logoUrl: string;
    firstName: string;
    resetLink: string;
    successLink: string;
}
declare const PasswordResetEmail: React.FC<PasswordResetEmailProps>;
export default PasswordResetEmail;
