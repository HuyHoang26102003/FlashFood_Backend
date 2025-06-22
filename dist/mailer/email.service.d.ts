import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
export declare class EmailService {
    private readonly transport;
    private readonly userService;
    constructor(transport: nodemailer.Transporter, userService: UsersService);
    generateVerificationCode(): string;
    sendPasswordResetEmail(to: string, resetToken: string, firstName: string): Promise<void>;
    sendVerificationEmail(to: string): Promise<string>;
    sendEmail(to: string, subject: string, text: string, html?: string): Promise<void>;
    verifyEmail(email: string, code: string): Promise<import("src/utils/createResponse").ApiResponse<any> | {
        message: string;
    }>;
}
