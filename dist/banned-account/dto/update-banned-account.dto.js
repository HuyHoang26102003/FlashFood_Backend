"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBannedAccountDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_banned_account_dto_1 = require("./create-banned-account.dto");
class UpdateBannedAccountDto extends (0, mapped_types_1.PartialType)(create_banned_account_dto_1.CreateBannedAccountDto) {
}
exports.UpdateBannedAccountDto = UpdateBannedAccountDto;
//# sourceMappingURL=update-banned-account.dto.js.map