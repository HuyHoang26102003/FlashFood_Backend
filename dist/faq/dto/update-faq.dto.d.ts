import { CreateFAQDto } from './create-faq.dto';
import { FAQStatus, FAQType, FAQContentBlock, FAQTargetUser } from '../entities/faq.entity';
declare const UpdateFAQDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateFAQDto>>;
export declare class UpdateFAQDto extends UpdateFAQDto_base {
    question?: string;
    answer?: FAQContentBlock[];
    type?: FAQType;
    status?: FAQStatus;
    target_user?: FAQTargetUser[];
}
export {};
