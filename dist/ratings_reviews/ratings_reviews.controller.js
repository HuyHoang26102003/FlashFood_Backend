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
exports.RatingsReviewsController = void 0;
const common_1 = require("@nestjs/common");
const ratings_reviews_service_1 = require("./ratings_reviews.service");
const create_ratings_review_dto_1 = require("./dto/create-ratings_review.dto");
const update_ratings_review_dto_1 = require("./dto/update-ratings_review.dto");
let RatingsReviewsController = class RatingsReviewsController {
    constructor(ratingsReviewsService) {
        this.ratingsReviewsService = ratingsReviewsService;
    }
    create(createRatingsReviewDto) {
        return this.ratingsReviewsService.create(createRatingsReviewDto);
    }
    findAll() {
        return this.ratingsReviewsService.findAll();
    }
    findOne(id) {
        return this.ratingsReviewsService.findOne(id);
    }
    update(id, updateRatingsReviewDto) {
        return this.ratingsReviewsService.update(id, updateRatingsReviewDto);
    }
    remove(id) {
        return this.ratingsReviewsService.remove(id);
    }
};
exports.RatingsReviewsController = RatingsReviewsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ratings_review_dto_1.CreateRatingsReviewDto]),
    __metadata("design:returntype", void 0)
], RatingsReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RatingsReviewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RatingsReviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ratings_review_dto_1.UpdateRatingsReviewDto]),
    __metadata("design:returntype", void 0)
], RatingsReviewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RatingsReviewsController.prototype, "remove", null);
exports.RatingsReviewsController = RatingsReviewsController = __decorate([
    (0, common_1.Controller)('ratings-reviews'),
    __metadata("design:paramtypes", [ratings_reviews_service_1.RatingsReviewsService])
], RatingsReviewsController);
//# sourceMappingURL=ratings_reviews.controller.js.map