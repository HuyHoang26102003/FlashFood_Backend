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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerCustomModule = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const nodemailer = __importStar(require("nodemailer"));
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const config_1 = require("@nestjs/config");
let MailerCustomModule = class MailerCustomModule {
};
exports.MailerCustomModule = MailerCustomModule;
exports.MailerCustomModule = MailerCustomModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const user = configService.get('GMAIL_USER');
                    const pass = configService.get('GMAIL_APP_PASSWORD');
                    if (!user || !pass) {
                        console.error('SMTP credentials missing:', { user, pass });
                        throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not found in environment variables');
                    }
                    return {
                        transport: nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                            auth: {
                                user,
                                pass
                            }
                        }),
                        defaults: {
                            from: '"Flashfood" <no-reply@flashfood.com>'
                        },
                        template: {
                            adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                            options: {
                                strict: true
                            }
                        }
                    };
                },
                inject: [config_1.ConfigService]
            })
        ],
        providers: [
            {
                provide: 'MAIL_TRANSPORT',
                useFactory: async (configService) => {
                    const user = configService.get('GMAIL_USER');
                    const pass = configService.get('GMAIL_APP_PASSWORD');
                    if (!user || !pass) {
                        console.error('SMTP credentials missing:', { user, pass });
                        throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not found in environment variables');
                    }
                    return nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user,
                            pass
                        }
                    });
                },
                inject: [config_1.ConfigService]
            }
        ],
        exports: ['MAIL_TRANSPORT']
    })
], MailerCustomModule);
//# sourceMappingURL=mailer.module.js.map