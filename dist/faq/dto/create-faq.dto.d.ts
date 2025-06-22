import { FAQStatus, FAQType, FAQContentBlock, FAQTargetUser } from '../entities/faq.entity';
export declare class CreateFAQDto {
    question: string;
    answer: FAQContentBlock[];
    type?: FAQType;
    status?: FAQStatus;
    target_user?: FAQTargetUser[];
}
