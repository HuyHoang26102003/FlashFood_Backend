"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const email_service_1 = require("../mailer/email.service");
const users_service_1 = require("../users/users.service");
const createResponse_1 = require("../utils/createResponse");
const Payload_1 = require("../types/Payload");
const create_restaurant_dto_1 = require("../restaurants/dto/create-restaurant.dto");
const image_urls_1 = require("../assets/image_urls");
let AuthController = class AuthController {
    constructor(authService, emailService, usersService) {
        this.authService = authService;
        this.emailService = emailService;
        this.usersService = usersService;
    }
    async registerCustomer(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.CUSTOMER);
        console.log('check regis res', registrationResponse);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async registerDriver(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.DRIVER);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', registrationResponse?.data?.data, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse?.data;
        }
    }
    async registerRestaurant(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.RESTAURANT_OWNER);
        console.log('check regist resposne', registrationResponse);
        if (registrationResponse?.data?.data ||
            (registrationResponse?.EC === 0 && registrationResponse?.data)) {
            const userId = registrationResponse?.data?.data?.user_id ??
                registrationResponse?.data?.id;
            const code = await this.emailService.sendVerificationEmail(userData?.email);
            await this.usersService.update(userId, { verification_code: code });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async registerFWallet(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.F_WALLET);
        console.log('check res', registrationResponse);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async registerCustomerCare(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async registerSuperAdmin(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.SUPER_ADMIN);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async registerFinanceAdmin(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.FINANCE_ADMIN);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async registerCompanionAdmin(userData) {
        const registrationResponse = await this.authService.register(userData, Payload_1.Enum_UserType.COMPANION_ADMIN);
        if (registrationResponse?.data?.data) {
            const code = await this.emailService.sendVerificationEmail(userData.email);
            await this.usersService.update(registrationResponse.data.data.user_id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Registration successful, verification email sent');
        }
        else {
            return registrationResponse;
        }
    }
    async loginCustomer(credentials) {
        return this.authService.login(credentials, Payload_1.Enum_UserType.CUSTOMER);
    }
    async loginDriver(credentials) {
        return this.authService.login(credentials, Payload_1.Enum_UserType.DRIVER);
    }
    async loginFWallet(credentials) {
        return this.authService.login(credentials, Payload_1.Enum_UserType.F_WALLET);
    }
    async loginRestaurant(credentials) {
        return this.authService.login(credentials, Payload_1.Enum_UserType.RESTAURANT_OWNER);
    }
    async loginCustomerCare(credentials) {
        console.log('fall here contorller', {
            credentials
        });
        return this.authService.login(credentials, Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE);
    }
    async loginCompanionAdmin(credentials) {
        console.log('fall here contorller', {
            credentials
        });
        return this.authService.login(credentials, Payload_1.Enum_UserType.COMPANION_ADMIN);
    }
    async loginFinanceAdmin(credentials) {
        console.log('fall here contorller', {
            credentials
        });
        return this.authService.login(credentials, Payload_1.Enum_UserType.FINANCE_ADMIN);
    }
    async loginSuperAdmin(credentials) {
        console.log('fall here contorller', {
            credentials
        });
        return this.authService.login(credentials, Payload_1.Enum_UserType.SUPER_ADMIN);
    }
    async verifyEmail({ email, code }) {
        try {
            if (!email || !code) {
                return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'You must provide a valid email and a verification code');
            }
            const result = await this.emailService.verifyEmail(email, code);
            return result;
        }
        catch (error) {
            console.error('Error during email verification:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred during verification, please try again.');
        }
    }
    async requestVerifyAccount({ email }) {
        try {
            if (!email) {
                return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'You must provide a valid email and a verification code');
            }
            const user = await this.usersService.findByCondition({ email: email });
            const code = await this.emailService.sendVerificationEmail(email);
            await this.usersService.update(user.data.id, {
                verification_code: code
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Your account verification request has been sent to your email!');
        }
        catch (error) {
            console.error('Error sending verify email verification:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred during verification, please try again.');
        }
    }
    async requestResetPassword({ email }) {
        try {
            if (!email) {
                return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'You must provide a valid email');
            }
            const result = await this.authService.requestPasswordReset(email);
            return result;
        }
        catch (error) {
            console.error('Error during password reset request:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred during password reset request, please try again.');
        }
    }
    async renderChangePasswordSuccess() {
        return {
            logoFlashfood: image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO
        };
    }
    async resetPassword({ token, newPassword }, res) {
        try {
            if (!token || !newPassword) {
                return res.render('reset-password', {
                    token,
                    error: 'You must provide a valid token and new password',
                    logoFlashfood: image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO
                });
            }
            const result = await this.authService.resetPassword(token, newPassword);
            if (result.EC === 0) {
                return res.redirect('/auth/change-password-success');
            }
            else {
                return res.render('reset-password', {
                    token,
                    error: result.EM || 'Failed to reset password. Please try again.',
                    logoFlashfood: image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO
                });
            }
        }
        catch (error) {
            console.error('Error during password reset:', error);
            return res.render('reset-password', {
                token,
                error: 'An error occurred during password reset, please try again.',
                logoFlashfood: image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO
            });
        }
    }
    async renderResetPasswordPage(token) {
        if (!token) {
            return {
                token: '',
                error: 'Invalid or missing token. Please request a new password reset link.',
                logoFlashfood: image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO
            };
        }
        return {
            token,
            logoFlashfood: image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register-customer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCustomer", null);
__decorate([
    (0, common_1.Post)('register-driver'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerDriver", null);
__decorate([
    (0, common_1.Post)('register-restaurant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_restaurant_dto_1.CreateRestaurantSignup]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerRestaurant", null);
__decorate([
    (0, common_1.Post)('register-fwallet'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerFWallet", null);
__decorate([
    (0, common_1.Post)('register-customer-care'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCustomerCare", null);
__decorate([
    (0, common_1.Post)('register-super-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerSuperAdmin", null);
__decorate([
    (0, common_1.Post)('register-finance-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerFinanceAdmin", null);
__decorate([
    (0, common_1.Post)('register-companion-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCompanionAdmin", null);
__decorate([
    (0, common_1.Post)('login-customer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginCustomer", null);
__decorate([
    (0, common_1.Post)('login-driver'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginDriver", null);
__decorate([
    (0, common_1.Post)('login-fwallet'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginFWallet", null);
__decorate([
    (0, common_1.Post)('login-restaurant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginRestaurant", null);
__decorate([
    (0, common_1.Post)('login-customer-care'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginCustomerCare", null);
__decorate([
    (0, common_1.Post)('login-companion-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginCompanionAdmin", null);
__decorate([
    (0, common_1.Post)('login-finance-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginFinanceAdmin", null);
__decorate([
    (0, common_1.Post)('login-super-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginSuperAdmin", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('request-verify-account'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestVerifyAccount", null);
__decorate([
    (0, common_1.Post)('request-reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestResetPassword", null);
__decorate([
    (0, common_1.Get)('change-password-success'),
    (0, common_1.Render)('change-password-success'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "renderChangePasswordSuccess", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('reset-password'),
    (0, common_1.Render)('reset-password'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "renderResetPasswordPage", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        email_service_1.EmailService,
        users_service_1.UsersService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map