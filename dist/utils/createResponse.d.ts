import { ArgumentsHost, BadRequestException, ExceptionFilter } from '@nestjs/common';
import { ResponseStatus } from './constants';
import { Response } from 'express';
export type ResponseStatusType = keyof typeof ResponseStatus;
export interface ApiResponse<T> {
    EC: number;
    EM: string;
    data: T | null;
}
export declare function createResponse<T>(status: ResponseStatusType, data: T | null, message?: string): ApiResponse<T>;
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost): Response<any, Record<string, any>>;
}
