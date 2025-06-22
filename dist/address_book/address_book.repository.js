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
exports.AddressBookRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const address_book_entity_1 = require("./entities/address_book.entity");
let AddressBookRepository = class AddressBookRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(createDto) {
        const address = this.repository.create(createDto);
        return await this.repository.save(address);
    }
    async findAll() {
        return await this.repository.find();
    }
    async findById(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async findByStreetAndCity(street, city) {
        return await this.repository.findOne({ where: { street, city } });
    }
    async update(id, updateDto) {
        const address = await this.findById(id);
        if (!address)
            return null;
        await this.repository.update(id, {
            ...updateDto,
            updated_at: Math.floor(Date.now() / 1000),
        });
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
};
exports.AddressBookRepository = AddressBookRepository;
exports.AddressBookRepository = AddressBookRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(address_book_entity_1.AddressBook)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], AddressBookRepository);
//# sourceMappingURL=address_book.repository.js.map