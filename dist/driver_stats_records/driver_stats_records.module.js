"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverStatsRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const driver_stats_records_service_1 = require("./driver_stats_records.service");
const driver_stats_records_controller_1 = require("./driver_stats_records.controller");
const typeorm_1 = require("@nestjs/typeorm");
const driver_stats_record_entity_1 = require("./entities/driver_stats_record.entity");
const online_session_repository_1 = require("../online-sessions/online-session.repository");
const online_session_entity_1 = require("../online-sessions/entities/online-session.entity");
const driver_progress_stage_entity_1 = require("../driver_progress_stages/entities/driver_progress_stage.entity");
const driver_progress_stages_repository_1 = require("../driver_progress_stages/driver_progress_stages.repository");
const ratings_reviews_repository_1 = require("../ratings_reviews/ratings_reviews.repository");
const ratings_review_entity_1 = require("../ratings_reviews/entities/ratings_review.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let DriverStatsRecordsModule = class DriverStatsRecordsModule {
};
exports.DriverStatsRecordsModule = DriverStatsRecordsModule;
exports.DriverStatsRecordsModule = DriverStatsRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                driver_stats_record_entity_1.DriverStatsRecord,
                online_session_entity_1.OnlineSession,
                driver_progress_stage_entity_1.DriverProgressStage,
                ratings_review_entity_1.RatingsReview,
                order_entity_1.Order
            ])
        ],
        controllers: [driver_stats_records_controller_1.DriverStatsController],
        providers: [
            driver_stats_records_service_1.DriverStatsService,
            online_session_repository_1.OnlineSessionsRepository,
            driver_progress_stages_repository_1.DriverProgressStagesRepository,
            ratings_reviews_repository_1.RatingsReviewsRepository
        ]
    })
], DriverStatsRecordsModule);
//# sourceMappingURL=driver_stats_records.module.js.map