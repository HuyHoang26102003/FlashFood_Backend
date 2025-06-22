"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRIVER_MOCK = exports.ADMIN_MOCK = exports.MENU_ITEM_VARIANT_MOCK = exports.MENU_ITEM_MOCK = exports.FOOD_CATEGORY_MOCK = exports.ADDRESS_2_MOCK = exports.ADDRESS_1_MOCK = exports.RESTAURANT_MOCK = exports.CUSTOMER_MOCK = exports.FLASHFOOD_FINANCE = exports.FIXED_DELIVERY_DRIVER_WAGE = exports.ResponseStatus = void 0;
exports.ResponseStatus = {
    OK: { httpCode: 200, message: 'Success', code: 0 },
    MissingInput: { httpCode: 400, message: 'Missing Input', code: 1 },
    InvalidFormatInput: {
        httpCode: 400,
        message: 'Invalid Format Input',
        code: 2
    },
    EmailNotFound: { httpCode: 401, message: 'Email not found', code: 3 },
    WrongPassword: { httpCode: 401, message: 'Wrong password', code: 4 },
    Unauthorized: { httpCode: 401, message: 'Unauthorized', code: 3 },
    ServerError: { httpCode: 500, message: 'Server Error', code: -1 },
    NotFound: { httpCode: 404, message: 'Not Found', code: -2 },
    DuplicatedRecord: { httpCode: 409, message: 'Duplicated Record', code: -3 },
    Forbidden: { httpCode: 403, message: 'Forbidden (Authorization)', code: -4 },
    InsufficientBalance: {
        httpCode: 400,
        message: 'Insufficient balance in the source wallet',
        code: -8
    },
    NotAcceptingOrders: {
        httpCode: 400,
        message: 'This restaurant is currently not accepting at the moment.',
        code: -5
    },
    NoDrivers: {
        httpCode: 400,
        message: 'This restaurant is currently not accepting at the moment.',
        code: -6
    },
    DRIVER_MAXIMUM_ORDER: {
        httpCode: 400,
        message: 'Driver has reached maximum number of orders',
        code: -7
    },
    PROMOTION_EXPIRED: {
        httpCode: 400,
        message: 'Expired',
        code: -9
    },
    EXPIRED: {
        httpCode: 400,
        message: 'Expired',
        code: -9
    },
    NOT_AVAILABLE: {
        httpCode: 400,
        message: 'Expired',
        code: -9
    }
};
exports.FIXED_DELIVERY_DRIVER_WAGE = 20;
exports.FLASHFOOD_FINANCE = {
    id: 'F_WALLET_32bd844d-4558-4f5b-8906-4e74d733cd91',
    user_id: 'USR_c68740f1-f629-4774-8d94-3b221df61cae',
    email: 'finance.flashfood@gmail.com'
};
exports.CUSTOMER_MOCK = {
    customer_id: 'FF_CUS_430b0b56-df21-4ac4-ac98-904dd522f0ee',
    user_id: 'USR_55a7dbf9-82e3-4a10-9ba6-a9783e5fa5eb',
    fwallet_id: 'F_WALLET_8ebec8ae-fbe3-4d62-8966-e3f1fd4093dc',
    email: 'flashfood211@gmail.com'
};
exports.RESTAURANT_MOCK = {
    restaurant_id: 'FF_RES_f0f1d013-b624-42c7-9f97-7c1445beb978',
    user_id: 'USR_46682f77-c104-41f8-9ce1-0bc62decf2a5',
    fwallet_id: 'F_WALLET_3760cc6c-f130-452b-bb44-b1380f0c1e95',
    email: 'flashfood212@gmail.com'
};
exports.ADDRESS_1_MOCK = {
    id: 'FF_AB_213f07fb-5e25-43c3-88b5-e878bdc56328'
};
exports.ADDRESS_2_MOCK = {
    id: 'FF_AB_6291084a-e944-465d-8cdd-c9b40bec9ace'
};
exports.FOOD_CATEGORY_MOCK = {
    id: 'FF_FC_c0d2925e-58f1-4388-b7f8-a578b2266433'
};
exports.MENU_ITEM_MOCK = {
    id: 'FF_MENU_ITEM_10d5f687-8f07-45f9-aa29-8a552956391f'
};
exports.MENU_ITEM_VARIANT_MOCK = {
    id: 'FF_MENU_ITEM_VARIANT_57a31677-ada6-484b-b706-291b71bd613d'
};
exports.ADMIN_MOCK = {
    admin_id: 'FF_ADMIN_ea42a109-ec7a-4014-ada2-a050c9e817ed',
    user_id: 'USR_dfdb430a-4506-401f-8242-634ea8d9735e'
};
exports.DRIVER_MOCK = {
    driver_id: 'FF_DRI_d561f2ba-b3a8-4190-8221-ec2a86c85010',
    user_id: 'USR_4eb1f0c4-1025-4de3-b210-b942ffbf77aa'
};
//# sourceMappingURL=constants.js.map