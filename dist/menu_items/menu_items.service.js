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
var MenuItemsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemsService = void 0;
const createResponse_1 = require("../utils/createResponse");
const menu_item_variants_service_1 = require("../menu_item_variants/menu_item_variants.service");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const menu_items_repository_1 = require("./menu_items.repository");
const menu_item_entity_1 = require("./entities/menu_item.entity");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const typeorm_3 = require("typeorm");
const redis_service_1 = require("../redis/redis.service");
let MenuItemsService = MenuItemsService_1 = class MenuItemsService {
    constructor(menuItemRepository, menuItemsRepository, restaurantRepository, foodCategoriesRepository, menuItemVariantsService, redisService) {
        this.menuItemRepository = menuItemRepository;
        this.menuItemsRepository = menuItemsRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodCategoriesRepository = foodCategoriesRepository;
        this.menuItemVariantsService = menuItemVariantsService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(MenuItemsService_1.name);
    }
    async create(createMenuItemDto) {
        try {
            const validationResult = await this.validateMenuItemData(createMenuItemDto);
            if (validationResult !== true) {
                return validationResult;
            }
            const existingMenuItem = await this.findExistingMenuItem(createMenuItemDto.name, createMenuItemDto.restaurant_id);
            if (existingMenuItem) {
                return await this.handleExistingMenuItem(existingMenuItem, createMenuItemDto);
            }
            return await this.createNewMenuItem(createMenuItemDto);
        }
        catch (error) {
            return this.handleError('Error creating menu item:', error);
        }
    }
    async findAll() {
        try {
            const menuItems = await this.menuItemsRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', menuItems, 'Fetched all menu items');
        }
        catch (error) {
            return this.handleError('Error fetching menu items:', error);
        }
    }
    calculateDiscountedPrice(originalPrice, promotion) {
        let discountedPrice;
        if (promotion.discount_type === 'PERCENTAGE') {
            discountedPrice = originalPrice * (1 - promotion.discount_value / 100);
        }
        else if (promotion.discount_type === 'FIXED') {
            discountedPrice = originalPrice - promotion.discount_value;
        }
        else {
            return originalPrice;
        }
        return Math.max(0, Number(discountedPrice.toFixed(2)));
    }
    async findOne(id) {
        try {
            console.log('Starting findOne with id:', id);
            const menuItem = await this.menuItemsRepository.findOne({
                where: { id: (0, typeorm_1.Equal)(id) },
                relations: ['variants', 'restaurant']
            });
            console.log('check menu item', JSON.stringify(menuItem, null, 2));
            if (!menuItem) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Menu Item not found');
            }
            const restaurant = await this.restaurantRepository.findOne({
                where: { id: (0, typeorm_1.Equal)(menuItem.restaurant_id) },
                relations: ['promotions', 'promotions.food_categories']
            });
            console.log('check res', JSON.stringify(restaurant, null, 2));
            if (!restaurant) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Restaurant not found');
            }
            let itemPriceAfterPromotion = null;
            const processedVariants = [];
            const now = Math.floor(Date.now() / 1000);
            const itemCategories = menuItem.category || [];
            console.log('check item categories', itemCategories);
            const applicablePromotions = restaurant.promotions?.filter(promotion => {
                const isActive = promotion.status === 'ACTIVE' &&
                    now >= Number(promotion.start_date) &&
                    now <= Number(promotion.end_date);
                const hasMatchingCategory = promotion.food_category_ids?.some(categoryId => itemCategories.includes(categoryId)) || false;
                console.log(`check promotion ${promotion.id}: active=${isActive}, hasMatchingCategory=${hasMatchingCategory}`, promotion.food_category_ids);
                return isActive && hasMatchingCategory;
            }) || [];
            if (applicablePromotions.length > 0) {
                applicablePromotions.forEach(promotion => {
                    const discountedPrice = this.calculateDiscountedPrice(Number(menuItem.price), promotion);
                    console.log(`apply promotion ${promotion.id} for item ${menuItem.id}: original=${menuItem.price}, discounted=${discountedPrice}`);
                    if (itemPriceAfterPromotion === null ||
                        discountedPrice < itemPriceAfterPromotion) {
                        itemPriceAfterPromotion = discountedPrice;
                    }
                });
            }
            if (menuItem.variants && menuItem.variants.length > 0) {
                menuItem.variants.forEach((variant) => {
                    let variantPriceAfterPromotion = null;
                    if (applicablePromotions.length > 0) {
                        applicablePromotions.forEach(promotion => {
                            const discountedPrice = this.calculateDiscountedPrice(Number(variant.price), promotion);
                            console.log(`apply promotion ${promotion.id} for variant ${variant.id}: original=${variant.price}, discounted=${discountedPrice}`);
                            if (variantPriceAfterPromotion === null ||
                                discountedPrice < variantPriceAfterPromotion) {
                                variantPriceAfterPromotion = discountedPrice;
                            }
                        });
                    }
                    processedVariants.push({
                        id: variant.id,
                        menu_id: variant.menu_id,
                        variant: variant.variant,
                        description: variant.description,
                        avatar: variant.avatar,
                        availability: variant.availability,
                        default_restaurant_notes: variant.default_restaurant_notes,
                        price: variant.price,
                        discount_rate: variant.discount_rate,
                        created_at: variant.created_at,
                        updated_at: variant.updated_at,
                        price_after_applied_promotion: variantPriceAfterPromotion
                    });
                });
            }
            const menuItemResponse = {
                id: menuItem.id,
                restaurant_id: menuItem.restaurant_id,
                name: menuItem.name,
                description: menuItem.description,
                price: menuItem.price,
                category: menuItem.category,
                avatar: menuItem.avatar,
                availability: menuItem.availability,
                suggest_notes: menuItem.suggest_notes,
                discount: menuItem.discount,
                purchase_count: menuItem.purchase_count,
                created_at: menuItem.created_at,
                updated_at: menuItem.updated_at,
                price_after_applied_promotion: itemPriceAfterPromotion,
                variants: processedVariants
            };
            console.log('Returning response for menu item:', menuItemResponse.id);
            return (0, createResponse_1.createResponse)('OK', { menuItem: menuItemResponse, variants: processedVariants }, 'Fetched menu item successfully');
        }
        catch (error) {
            console.error('Caught error in findOne:', error);
            return this.handleError('Error fetching menu item:', error);
        }
    }
    async update(id, updateMenuItemDto) {
        try {
            const existingMenuItem = await this.menuItemsRepository.findById(id);
            if (!existingMenuItem) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Menu Item not found');
            }
            const updatedMenuItem = await this.updateExistingMenuItem(existingMenuItem, updateMenuItemDto);
            return (0, createResponse_1.createResponse)('OK', updatedMenuItem, 'Menu Item updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating menu item:', error);
        }
    }
    async remove(id) {
        try {
            await this.menuItemsRepository.remove(id);
            return (0, createResponse_1.createResponse)('OK', null, 'Menu Item deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting menu item:', error);
        }
    }
    async updateEntityAvatar(uploadResult, menuItemId) {
        try {
            const menuItem = await this.menuItemsRepository.update(menuItemId, {
                avatar: { url: uploadResult.url, key: uploadResult.public_id }
            });
            return this.handleMenuItemResponse(menuItem);
        }
        catch (error) {
            return this.handleError('Error updating menu item avatar:', error);
        }
    }
    async validateMenuItemData(createMenuItemDto) {
        const { restaurant_id, category } = createMenuItemDto;
        const restaurant = await this.restaurantRepository.findById(restaurant_id);
        if (!restaurant) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Restaurant not found');
        }
        for (const categoryId of category) {
            const foodCategory = await this.foodCategoriesRepository.findById(categoryId);
            if (!foodCategory) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Food Category with ID ${categoryId} not found`);
            }
        }
        return true;
    }
    async findExistingMenuItem(name, restaurantId) {
        return this.menuItemsRepository.findOne({
            where: { name: (0, typeorm_1.Equal)(name), restaurant_id: (0, typeorm_1.Equal)(restaurantId) }
        });
    }
    async handleExistingMenuItem(existingMenuItem, createMenuItemDto) {
        const variants = await Promise.all(createMenuItemDto.variants.map(variant => this.createVariant(variant, existingMenuItem)));
        if (createMenuItemDto.discount) {
            await this.menuItemsRepository.update(existingMenuItem.id, {
                discount: createMenuItemDto.discount
            });
        }
        const updatedMenuItem = await this.menuItemsRepository.findById(existingMenuItem.id);
        return (0, createResponse_1.createResponse)('OK', { ...updatedMenuItem, variants }, 'Menu Item and variants updated successfully');
    }
    async createNewMenuItem(createMenuItemDto) {
        const menuItemData = {
            ...createMenuItemDto,
            variants: [],
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000)
        };
        const newMenuItem = await this.menuItemsRepository.create(menuItemData);
        let variants = [];
        if (createMenuItemDto.variants?.length) {
            variants = await Promise.all(createMenuItemDto.variants.map(variant => this.createVariant(variant, newMenuItem)));
        }
        return (0, createResponse_1.createResponse)('OK', {
            ...newMenuItem,
            variants
        }, 'Menu Item and variants created successfully');
    }
    async updateExistingMenuItem(menuItem, updateData) {
        const { variants, ...updateFields } = updateData;
        const updatedMenuItem = await this.menuItemsRepository.update(menuItem.id, {
            ...updateFields,
            updated_at: Math.floor(Date.now() / 1000)
        });
        if (variants?.length) {
            await Promise.all(variants.map(async (variantData) => {
                const variantDto = {
                    price: variantData.price || 0,
                    description: variantData.description || '',
                    variant: variantData.description || ''
                };
                return this.createVariant(variantDto, updatedMenuItem);
            }));
        }
        return updatedMenuItem;
    }
    async createVariant(variantData, menuItem) {
        const newVariantData = {
            menu_id: menuItem.id,
            variant: variantData.variant || variantData.description || '',
            price: variantData.price || 0,
            description: variantData.description || '',
            avatar: menuItem.avatar || { key: '', url: '' },
            availability: true,
            default_restaurant_notes: [],
            discount_rate: 0
        };
        const result = await this.menuItemVariantsService.create(newVariantData);
        return result.data;
    }
    handleMenuItemResponse(menuItem) {
        if (!menuItem) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Menu item not found');
        }
        return (0, createResponse_1.createResponse)('OK', menuItem, 'Menu item retrieved successfully');
    }
    handleError(message, error) {
        console.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
    async findByRestaurantId(restaurantId) {
        try {
            const menuItems = await this.menuItemsRepository.findByRestaurantId(restaurantId);
            return (0, createResponse_1.createResponse)('OK', menuItems || [], 'Fetched menu items for restaurant');
        }
        catch (error) {
            this.logger.error('Error in findByRestaurantId:', error);
            return (0, createResponse_1.createResponse)('ServerError', [], 'An error occurred while fetching menu items');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.menuItemsRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            this.logger.error(`Error fetching paginated menu items: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
    async toggleAvailability(id) {
        try {
            const menuItem = await this.menuItemsRepository.findById(id);
            if (!menuItem) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Menu Item not found');
            }
            const newAvailability = !menuItem.availability;
            const updatedMenuItem = await this.menuItemsRepository.update(id, {
                availability: newAvailability,
                updated_at: Math.floor(Date.now() / 1000)
            });
            const cacheKey = `menu_item:${id}`;
            await this.redisService.set(cacheKey, JSON.stringify(updatedMenuItem), 300000);
            this.redisService.del(`menu_items:${menuItem.restaurant_id}`);
            return (0, createResponse_1.createResponse)('OK', updatedMenuItem, `Menu Item availability toggled to ${newAvailability}`);
        }
        catch (error) {
            return this.handleError('Error toggling menu item availability:', error);
        }
    }
};
exports.MenuItemsService = MenuItemsService;
exports.MenuItemsService = MenuItemsService = MenuItemsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(menu_item_entity_1.MenuItem)),
    __metadata("design:paramtypes", [typeorm_3.Repository,
        menu_items_repository_1.MenuItemsRepository,
        restaurants_repository_1.RestaurantsRepository,
        food_categories_repository_1.FoodCategoriesRepository,
        menu_item_variants_service_1.MenuItemVariantsService,
        redis_service_1.RedisService])
], MenuItemsService);
//# sourceMappingURL=menu_items.service.js.map