import { ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
export declare class PermissionFilter {
    catch(exception: any, host: ArgumentsHost): Response<any, Record<string, any>>;
}
