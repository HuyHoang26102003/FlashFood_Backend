import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin.service';
export declare class PermissionGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly adminService;
    constructor(reflector: Reflector, jwtService: JwtService, adminService: AdminService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
