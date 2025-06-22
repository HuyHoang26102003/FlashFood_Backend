"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressBookController = void 0;
const common_1 = require("@nestjs/common");
const address_book_service_1 = require("./address_book.service");
const create_address_book_dto_1 = require("./dto/create-address_book.dto");
const update_address_book_dto_1 = require("./dto/update-address_book.dto");
let AddressBookController = class AddressBookController {
    constructor(addressBookService) {
        this.addressBookService = addressBookService;
    }
    async createAddressBook(createAddressBookDto) {
        return this.addressBookService.create(createAddressBookDto);
    }
    async getAllAddressBooks() {
        return this.addressBookService.findAll();
    }
    async getAddressBookById(id) {
        return this.addressBookService.findOne(id);
    }
    async updateAddressBook(addressBookId, updateAddressBookDto) {
        console.log('check controller oaram, addressBookId:', addressBookId, 'dto: ', updateAddressBookDto);
        return this.addressBookService.update(addressBookId, updateAddressBookDto);
    }
    async deleteAddressBook(id) {
        return this.addressBookService.remove(id);
    }
};
exports.AddressBookController = AddressBookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_address_book_dto_1.CreateAddressBookDto]),
    __metadata("design:returntype", Promise)
], AddressBookController.prototype, "createAddressBook", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AddressBookController.prototype, "getAllAddressBooks", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AddressBookController.prototype, "getAddressBookById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_address_book_dto_1.UpdateAddressBookDto]),
    __metadata("design:returntype", Promise)
], AddressBookController.prototype, "updateAddressBook", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AddressBookController.prototype, "deleteAddressBook", null);
exports.AddressBookController = AddressBookController = __decorate([
    (0, common_1.Controller)('address_books'),
    __metadata("design:paramtypes", [address_book_service_1.AddressBookService])
], AddressBookController);
//# sourceMappingURL=address_book.controller.js.map