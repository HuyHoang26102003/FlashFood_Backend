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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UserRepository = class UserRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findByEmail(email) {
        return await this.repository.findOneBy({ email });
    }
    async create(userData) {
        const newUser = this.repository.create(userData);
        return this.repository.save(newUser);
    }
    async findAll() {
        return this.repository.find();
    }
    async findById(id, manager) {
        const repo = manager ? manager.getRepository(user_entity_1.User) : this.repository;
        return await repo.findOne({ where: { id } });
    }
    async update(id, updateDto, manager) {
        console.log('Updating user with ID:', id);
        console.log('Update data:', updateDto);
        if (!id) {
            console.error('Update called with invalid ID:', id);
            throw new Error('User ID is required for update');
        }
        const repo = manager ? manager.getRepository(user_entity_1.User) : this.repository;
        const updateData = {};
        Object.keys(updateDto).forEach(key => {
            if (updateDto[key] !== undefined) {
                if (key === 'verification_code') {
                    updateData[key] = parseInt(updateDto[key]?.toString() || '0', 10);
                }
                else {
                    updateData[key] = updateDto[key];
                }
            }
        });
        console.log('Final update data:', updateData);
        return repo.update({ id }, updateData);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
    async findOne(conditions) {
        if (conditions.where) {
            return await this.repository.findOne(conditions);
        }
        return await this.repository.findOneBy(conditions);
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRepository);
//# sourceMappingURL=users.repository.js.map