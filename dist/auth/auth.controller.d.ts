import { AuthService } from './auth.service';
import { EmailService } from 'src/mailer/email.service';
import { UsersService } from 'src/users/users.service';
import { CreateRestaurantSignup } from 'src/restaurants/dto/create-restaurant.dto';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly emailService;
    private readonly usersService;
    constructor(authService: AuthService, emailService: EmailService, usersService: UsersService);
    registerCustomer(userData: {
        phone: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
    }): Promise<any>;
    registerDriver(userData: {
        phone: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
    }): Promise<any>;
    registerRestaurant(userData: CreateRestaurantSignup): Promise<any>;
    registerFWallet(userData: {
        user_id: string;
        email: string;
        password: string;
        balance: string;
    }): Promise<any>;
    registerCustomerCare(userData: {
        user_id: string;
        email: string;
        password: string;
        balance: string;
    }): Promise<any>;
    registerSuperAdmin(userData: {
        user_id: string;
        email: string;
        password: string;
        balance: string;
    }): Promise<any>;
    registerFinanceAdmin(userData: {
        user_id: string;
        email: string;
        password: string;
        balance: string;
    }): Promise<any>;
    registerCompanionAdmin(userData: {
        user_id: string;
        email: string;
        password: string;
        balance: string;
    }): Promise<any>;
    loginCustomer(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginDriver(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginFWallet(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginRestaurant(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginCustomerCare(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginCompanionAdmin(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginFinanceAdmin(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    loginSuperAdmin(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    verifyEmail({ email, code }: {
        email: string;
        code: string;
    }): Promise<import("src/utils/createResponse").ApiResponse<any> | {
        message: string;
    }>;
    requestVerifyAccount({ email }: {
        email: string;
    }): Promise<import("src/utils/createResponse").ApiResponse<any>>;
    requestResetPassword({ email }: {
        email: string;
    }): Promise<import("src/utils/createResponse").ApiResponse<any>>;
    renderChangePasswordSuccess(): Promise<{
        logoFlashfood: string;
    }>;
    resetPassword({ token, newPassword }: {
        token: string;
        newPassword: string;
    }, res: Response): Promise<void>;
    renderResetPasswordPage(token: string): Promise<{
        token: string;
        error: string;
        logoFlashfood: string;
    } | {
        token: string;
        logoFlashfood: string;
        error?: undefined;
    }>;
}
