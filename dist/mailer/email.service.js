"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const react_1 = __importDefault(require("react"));
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const users_service_1 = require("../users/users.service");
const createResponse_1 = require("../utils/createResponse");
const image_urls_1 = require("../assets/image_urls");
const server_1 = require("react-dom/server");
const PasswordResetEmail_1 = __importDefault(require("./templates/PasswordResetEmail"));
const VerificationEmail_1 = __importDefault(require("./templates/VerificationEmail"));
let EmailService = class EmailService {
    constructor(transport, userService) {
        this.transport = transport;
        this.userService = userService;
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendPasswordResetEmail(to, resetToken, firstName) {
        const resetLink = `http://localhost:1310/auth/reset-password?token=${resetToken}`;
        const successLink = `http://localhost:1310/auth/change-password-success`;
        const logoFlashfood = image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO;
        const emailTemplate = (0, server_1.renderToStaticMarkup)(react_1.default.createElement(PasswordResetEmail_1.default, { logoUrl: logoFlashfood, firstName: firstName, resetLink: resetLink, successLink: successLink }));
        const htmlWithDoctype = `<!DOCTYPE html>${emailTemplate}`;
        try {
            await this.transport.sendMail({
                to,
                subject: 'Reset Your Password',
                html: htmlWithDoctype
            });
            console.log('Password reset email sent successfully');
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
    async sendVerificationEmail(to) {
        const verificationCode = this.generateVerificationCode();
        const logoFlashfood = image_urls_1.IMAGE_LINKS.LIGHT_FLASHFOOD_LOGO;
        const emailTemplate = (0, server_1.renderToStaticMarkup)(react_1.default.createElement(VerificationEmail_1.default, { logoUrl: logoFlashfood, verificationCode: verificationCode }));
        const htmlWithDoctype = `<!DOCTYPE html>${emailTemplate}`;
        try {
            await this.transport.sendMail({
                to,
                subject: 'Email Verification Code',
                html: htmlWithDoctype
            });
            return verificationCode;
        }
        catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }
    async sendEmail(to, subject, text, html) {
        try {
            await this.transport.sendMail({
                to,
                subject,
                text,
                html
            });
            console.log('Email sent successfully');
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }
    async verifyEmail(email, code) {
        const user = await this.userService.findByCondition({ email });
        if (user && user.data.verification_code === +code) {
            await this.userService.update(user.data.id, {
                is_verified: true
            });
            return (0, createResponse_1.createResponse)('OK', null, 'Email verified successfully');
        }
        return { message: 'Invalid verification code' };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)('MAIL_TRANSPORT')),
    __metadata("design:paramtypes", [typeof (_a = typeof nodemailer !== "undefined" && nodemailer.Transporter) === "function" ? _a : Object, users_service_1.UsersService])
], EmailService);
//# sourceMappingURL=email.service.js.map