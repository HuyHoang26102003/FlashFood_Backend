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
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
const createResponse_1 = require("./utils/createResponse");
const path_1 = require("path");
const permission_filter_1 = require("./filters/permission.filter");
const hbs = __importStar(require("hbs"));
dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useLogger(['debug', 'error', 'log', 'verbose', 'warn']);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:1310'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'auth',
            'ngrok-skip-browser-warning',
            'X-Content-Type-Options'
        ],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    });
    app.use((req, res, next) => {
        if (req.path.startsWith('/auth/reset-password') ||
            req.path.startsWith('/auth/change-password-success')) {
            res.setHeader('Content-Type', 'text/html');
            next();
            return;
        }
        res.setHeader('ngrok-skip-browser-warning', 'true');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    app.useGlobalFilters(new permission_filter_1.PermissionFilter());
    app.useGlobalFilters(new createResponse_1.HttpExceptionFilter());
    const viewsPath = (0, path_1.resolve)(__dirname, '..', 'src', 'views');
    console.log('Views directory:', viewsPath);
    app.setBaseViewsDir(viewsPath);
    app.setViewEngine('hbs');
    app.engine('hbs', hbs.__express);
    await app.listen(process.env.PORT ?? 1310);
    console.log('🚀 Server running on port', process.env.PORT ?? 1310);
}
bootstrap();
//# sourceMappingURL=main.js.map