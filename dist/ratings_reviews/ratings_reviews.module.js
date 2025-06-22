"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsReviewsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ratings_reviews_service_1 = require("./ratings_reviews.service");
const ratings_reviews_controller_1 = require("./ratings_reviews.controller");
const ratings_review_entity_1 = require("./entities/ratings_review.entity");
const ratings_reviews_repository_1 = require("./ratings_reviews.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
let RatingsReviewsModule = class RatingsReviewsModule {
};
exports.RatingsReviewsModule = RatingsReviewsModule;
exports.RatingsReviewsModule = RatingsReviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ratings_review_entity_1.RatingsReview,
                order_entity_1.Order,
                driver_entity_1.Driver,
                customer_entity_1.Customer,
                restaurant_entity_1.Restaurant
            ])
        ],
        controllers: [ratings_reviews_controller_1.RatingsReviewsController],
        providers: [ratings_reviews_service_1.RatingsReviewsService, ratings_reviews_repository_1.RatingsReviewsRepository],
        exports: [ratings_reviews_service_1.RatingsReviewsService, ratings_reviews_repository_1.RatingsReviewsRepository]
    })
], RatingsReviewsModule);
//# sourceMappingURL=ratings_reviews.module.js.map