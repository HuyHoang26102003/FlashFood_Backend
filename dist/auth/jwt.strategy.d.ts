import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly jwtService;
    private readonly usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    validate(payload: any): Promise<import("../utils/createResponse").ApiResponse<import("../users/entities/user.entity").User>>;
}
export {};
