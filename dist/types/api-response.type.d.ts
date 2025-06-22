export type ResponseStatus = 'OK' | 'NotFound' | 'ServerError' | 'DuplicatedRecord';
export interface ApiResponse<T> {
    status: ResponseStatus;
    data: T | null;
    message: string;
}
