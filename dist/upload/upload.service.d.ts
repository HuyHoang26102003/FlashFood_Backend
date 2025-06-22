export declare class UploadService {
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        public_id: string;
    }>;
}
