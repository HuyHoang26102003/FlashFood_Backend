"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
let UploadService = class UploadService {
    async uploadImage(file) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const result = await new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader
                    .upload_stream({
                    resource_type: 'auto'
                }, (error, uploadResult) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(uploadResult);
                    }
                })
                    .end(file.buffer);
            });
            return {
                url: result.secure_url,
                public_id: result.public_id
            };
        }
        catch (error) {
            throw new Error('Upload failed: ' + error.message);
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map