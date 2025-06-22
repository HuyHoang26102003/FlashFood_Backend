import { CreateBannedAccountDto } from './dto/create-banned-account.dto';
import { UpdateBannedAccountDto } from './dto/update-banned-account.dto';
export declare class BannedAccountService {
    create(createBannedAccountDto: CreateBannedAccountDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateBannedAccountDto: UpdateBannedAccountDto): string;
    remove(id: number): string;
}
