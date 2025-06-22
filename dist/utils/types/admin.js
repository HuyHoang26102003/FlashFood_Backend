"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = exports.AdminStatus = exports.AdminPermission = exports.AdminRole = void 0;
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["COMPANION_ADMIN"] = "COMPANION_ADMIN";
    AdminRole["FINANCE_ADMIN"] = "FINANCE_ADMIN";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
var AdminPermission;
(function (AdminPermission) {
    AdminPermission["MANAGE_USERS"] = "MANAGE_USERS";
    AdminPermission["MANAGE_RESTAURANTS"] = "MANAGE_RESTAURANTS";
    AdminPermission["MANAGE_ORDERS"] = "MANAGE_ORDERS";
    AdminPermission["MANAGE_PROMOTIONS"] = "MANAGE_PROMOTIONS";
    AdminPermission["MANAGE_PAYMENTS"] = "MANAGE_PAYMENTS";
    AdminPermission["MANAGE_SUPPORT"] = "MANAGE_SUPPORT";
    AdminPermission["MANAGE_DRIVERS"] = "MANAGE_DRIVERS";
    AdminPermission["BAN_ACCOUNTS"] = "BAN_ACCOUNTS";
    AdminPermission["VIEW_ANALYTICS"] = "VIEW_ANALYTICS";
    AdminPermission["MANAGE_ADMINS"] = "MANAGE_ADMINS";
})(AdminPermission || (exports.AdminPermission = AdminPermission = {}));
var AdminStatus;
(function (AdminStatus) {
    AdminStatus["ACTIVE"] = "ACTIVE";
    AdminStatus["INACTIVE"] = "INACTIVE";
    AdminStatus["SUSPENDED"] = "SUSPENDED";
})(AdminStatus || (exports.AdminStatus = AdminStatus = {}));
exports.RolePermissions = {
    [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
    [AdminRole.COMPANION_ADMIN]: [
        AdminPermission.MANAGE_RESTAURANTS,
        AdminPermission.MANAGE_DRIVERS,
        AdminPermission.MANAGE_SUPPORT,
        AdminPermission.VIEW_ANALYTICS
    ],
    [AdminRole.FINANCE_ADMIN]: [
        AdminPermission.MANAGE_PAYMENTS,
        AdminPermission.MANAGE_PROMOTIONS,
        AdminPermission.VIEW_ANALYTICS
    ]
};
//# sourceMappingURL=admin.js.map