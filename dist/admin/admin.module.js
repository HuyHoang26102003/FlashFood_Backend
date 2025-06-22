"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const admin_entity_1 = require("./entities/admin.entity");
const admin_repository_1 = require("./admin.repository");
const users_module_1 = require("../users/users.module");
const banned_account_entity_1 = require("../banned-account/entities/banned-account.entity");
const auth_service_1 = require("../auth/auth.service");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const customers_repository_1 = require("../customers/customers.repository");
const drivers_repository_1 = require("../drivers/drivers.repository");
const customer_cares_repository_1 = require("../customer_cares/customer_cares.repository");
const customer_entity_1 = require("../customers/entities/customer.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const cart_items_service_1 = require("../cart_items/cart_items.service");
const cart_items_repository_1 = require("../cart_items/cart_items.repository");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const menu_item_variants_repository_1 = require("../menu_item_variants/menu_item_variants.repository");
const cart_item_entity_1 = require("../cart_items/entities/cart_item.entity");
const menu_item_variant_entity_1 = require("../menu_item_variants/entities/menu_item_variant.entity");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const email_service_1 = require("../mailer/email.service");
const nodemailer = __importStar(require("nodemailer"));
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const address_book_repository_1 = require("../address_book/address_book.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const customer_care_entity_1 = require("../customer_cares/entities/customer_care.entity");
const user_entity_1 = require("../users/entities/user.entity");
const users_repository_1 = require("../users/users.repository");
const admin_controller_fake_1 = require("./admin.controller.fake");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                admin_entity_1.Admin,
                banned_account_entity_1.BannedAccount,
                fwallet_entity_1.FWallet,
                customer_entity_1.Customer,
                cart_item_entity_1.CartItem,
                menu_item_entity_1.MenuItem,
                menu_item_variant_entity_1.MenuItemVariant,
                driver_entity_1.Driver,
                transaction_entity_1.Transaction,
                food_category_entity_1.FoodCategory,
                address_book_entity_1.AddressBook,
                restaurant_entity_1.Restaurant,
                order_entity_1.Order,
                user_entity_1.User,
                customer_care_entity_1.CustomerCare
            ]),
            users_module_1.UsersModule
        ],
        controllers: [admin_controller_1.AdminController, admin_controller_fake_1.AdminControllerFake],
        providers: [
            {
                provide: 'MAIL_TRANSPORT',
                useFactory: () => {
                    return nodemailer.createTransport({
                        host: 'smtp.mailtrap.io',
                        port: 2525,
                        auth: {
                            user: '389c1523b80572',
                            pass: '9685cd52ea218d'
                        }
                    });
                }
            },
            admin_service_1.AdminService,
            admin_repository_1.AdminRepository,
            email_service_1.EmailService,
            cart_items_service_1.CartItemsService,
            cart_items_repository_1.CartItemsRepository,
            menu_items_repository_1.MenuItemsRepository,
            address_book_repository_1.AddressBookRepository,
            menu_item_variants_repository_1.MenuItemVariantsRepository,
            users_repository_1.UserRepository,
            auth_service_1.AuthService,
            fwallets_repository_1.FWalletsRepository,
            restaurants_repository_1.RestaurantsRepository,
            customers_repository_1.CustomersRepository,
            drivers_repository_1.DriversRepository,
            customer_cares_repository_1.CustomerCaresRepository
        ],
        exports: [admin_service_1.AdminService, admin_repository_1.AdminRepository]
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map