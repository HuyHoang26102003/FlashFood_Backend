import { BannedAccountService } from './banned-account.service';
import { CreateBannedAccountDto } from './dto/create-banned-account.dto';
import { UpdateBannedAccountDto } from './dto/update-banned-account.dto';
export declare class BannedAccountController {
    private readonly bannedAccountService;
    constructor(bannedAccountService: BannedAccountService);
    create(createBannedAccountDto: CreateBannedAccountDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateBannedAccountDto: UpdateBannedAccountDto): string;
    remove(id: string): string;
}
