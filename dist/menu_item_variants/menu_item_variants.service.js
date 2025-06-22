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
var MenuItemVariantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemVariantsService = void 0;
const common_1 = require("@nestjs/common");
const createResponse_1 = require("../utils/createResponse");
const menu_item_variants_repository_1 = require("./menu_item_variants.repository");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
let MenuItemVariantsService = MenuItemVariantsService_1 = class MenuItemVariantsService {
    constructor(menuItemVariantRepository, menuItemRepository) {
        this.menuItemVariantRepository = menuItemVariantRepository;
        this.menuItemRepository = menuItemRepository;
        this.logger = new common_1.Logger(MenuItemVariantsService_1.name);
    }
    async create(createMenuItemVariantDto) {
        const { menu_id, variant, description, avatar, availability, default_restaurant_notes, price, discount_rate } = createMenuItemVariantDto;
        const existingVariant = await this.menuItemVariantRepository.findByDetails(price, description, menu_id);
        if (existingVariant) {
            return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Menu Item Variant with this variant already exists for this menu');
        }
        const newVariant = await this.menuItemVariantRepository.create({
            menu_id,
            variant,
            description,
            avatar,
            availability,
            default_restaurant_notes,
            price,
            discount_rate,
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000)
        });
        const menuItem = await this.menuItemRepository.findById(menu_id);
        if (menuItem) {
            menuItem.variants = [...(menuItem.variants || []), newVariant];
            await this.menuItemRepository.save(menuItem);
        }
        return (0, createResponse_1.createResponse)('OK', newVariant, 'Menu Item Variant created and added to the menu item successfully');
    }
    async update(id, updateMenuItemVariantDto) {
        const updatedVariant = await this.menuItemVariantRepository.update(id, {
            ...updateMenuItemVariantDto,
            updated_at: Math.floor(Date.now() / 1000)
        });
        if (!updatedVariant) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Menu Item Variant not found');
        }
        return (0, createResponse_1.createResponse)('OK', updatedVariant, 'Menu Item Variant updated successfully');
    }
    async findAll(query = {}) {
        const menuItemVariants = await this.menuItemVariantRepository.findAll(query);
        return (0, createResponse_1.createResponse)('OK', menuItemVariants, 'Fetched menu item variants successfully');
    }
    async findOne(id) {
        const variant = await this.menuItemVariantRepository.findById(id);
        if (!variant) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Menu Item Variant not found');
        }
        return (0, createResponse_1.createResponse)('OK', variant, 'Fetched menu item variant successfully');
    }
    async findOneByDetails(price, description, menu_id) {
        return this.menuItemVariantRepository.findByDetails(price, description, menu_id);
    }
    async remove(id) {
        const variant = await this.menuItemVariantRepository.findById(id);
        if (!variant) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Menu Item Variant not found');
        }
        const menuItem = await this.menuItemRepository.findById(variant.menu_id);
        if (menuItem) {
            menuItem.variants = menuItem.variants.filter(v => v.id !== id);
            await this.menuItemRepository.save(menuItem);
        }
        await this.menuItemVariantRepository.remove(id);
        return (0, createResponse_1.createResponse)('OK', null, 'Menu Item Variant deleted successfully');
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.menuItemVariantRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            this.logger.error(`Error fetching paginated menu item variants: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
};
exports.MenuItemVariantsService = MenuItemVariantsService;
exports.MenuItemVariantsService = MenuItemVariantsService = MenuItemVariantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menu_item_variants_repository_1.MenuItemVariantsRepository,
        menu_items_repository_1.MenuItemsRepository])
], MenuItemVariantsService);
//# sourceMappingURL=menu_item_variants.service.js.map