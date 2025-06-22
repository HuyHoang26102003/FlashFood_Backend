import { AppService } from './app.service';
import { EmailService } from './mailer/email.service';
export declare class AppController {
    private readonly appService;
    private readonly emailService;
    constructor(appService: AppService, emailService: EmailService);
    getHello(): string;
    sendTestEmail(): Promise<"Test email sent!" | "Failed to send email">;
}
