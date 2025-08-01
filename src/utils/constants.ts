export const ResponseStatus = {
  OK: { httpCode: 200, message: 'Success', code: 0 }, // Success
  MissingInput: { httpCode: 400, message: 'Missing Input', code: 1 }, // Missing Input
  InvalidFormatInput: {
    httpCode: 400,
    message: 'Invalid Format Input',
    code: 2
  }, // Invalid Format Input
  EmailNotFound: { httpCode: 401, message: 'Email not found', code: 3 }, // Unauthorized
  WrongPassword: { httpCode: 401, message: 'Wrong password', code: 4 }, // Unauthorized
  Unauthorized: { httpCode: 401, message: 'Unauthorized', code: 3 }, // Unauthorized
  ServerError: { httpCode: 500, message: 'Server Error', code: -1 }, // Server Error
  NotFound: { httpCode: 404, message: 'Not Found', code: -2 }, // Not Found
  DuplicatedRecord: { httpCode: 409, message: 'Duplicated Record', code: -3 }, // Duplicated Record
  Forbidden: { httpCode: 403, message: 'Forbidden (Authorization)', code: -4 }, // Forbidden
  InsufficientBalance: {
    httpCode: 400,
    message: 'Insufficient balance in the source wallet',
    code: -8
  }, // Insufficient balance in the source wallet
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
  },
  VOUCHER_NOT_FOUND: {
    httpCode: 404,
    message: 'Voucher not found',
    code: -10
  },
  VOUCHER_EXPIRED: {
    httpCode: 400,
    message: 'Voucher has expired',
    code: -11
  },
  VOUCHER_NOT_ACTIVE: {
    httpCode: 400,
    message: 'Voucher is not active',
    code: -12
  },
  VOUCHER_USAGE_LIMIT_REACHED: {
    httpCode: 400,
    message: 'Voucher usage limit reached',
    code: -13
  },
  VOUCHER_TIME_RESTRICTION: {
    httpCode: 400,
    message: 'Voucher cannot be used at this time',
    code: -14
  },
  VOUCHER_DAY_RESTRICTION: {
    httpCode: 400,
    message: 'Voucher cannot be used today',
    code: -15
  },
  VOUCHER_MINIMUM_ORDER_NOT_MET: {
    httpCode: 400,
    message: 'Minimum order value not met for voucher',
    code: -16
  },
  VOUCHER_CUSTOMER_USAGE_LIMIT: {
    httpCode: 400,
    message: 'Customer has reached usage limit for this voucher',
    code: -17
  },
  VOUCHER_RESTAURANT_RESTRICTION: {
    httpCode: 400,
    message: 'Voucher not applicable to this restaurant',
    code: -18
  },
  VOUCHER_CATEGORY_RESTRICTION: {
    httpCode: 400,
    message: 'Voucher not applicable to items in order',
    code: -19
  },
  VOUCHER_MAX_LIMIT_EXCEEDED: {
    httpCode: 400,
    message: 'Maximum 2 vouchers can be applied per order',
    code: -20
  }
};

export const FIXED_DELIVERY_DRIVER_WAGE = 20;
export const AVERAGE_SPEED_KM_H = 40;

export const FLASHFOOD_FINANCE = {
  id: 'F_WALLET_32bd844d-4558-4f5b-8906-4e74d733cd91',
  user_id: 'USR_c68740f1-f629-4774-8d94-3b221df61cae',
  email: 'finance.flashfood@gmail.com'
};
export const CUSTOMER_MOCK = {
  customer_id: 'FF_CUS_430b0b56-df21-4ac4-ac98-904dd522f0ee',
  user_id: 'USR_55a7dbf9-82e3-4a10-9ba6-a9783e5fa5eb',
  fwallet_id: 'F_WALLET_8ebec8ae-fbe3-4d62-8966-e3f1fd4093dc',
  email: 'flashfood211@gmail.com'
};
export const RESTAURANT_MOCK = {
  restaurant_id: 'FF_RES_f0f1d013-b624-42c7-9f97-7c1445beb978',
  user_id: 'USR_46682f77-c104-41f8-9ce1-0bc62decf2a5',
  fwallet_id: 'F_WALLET_3760cc6c-f130-452b-bb44-b1380f0c1e95',
  email: 'flashfood212@gmail.com'
};
export const ADDRESS_1_MOCK = {
  id: 'FF_AB_213f07fb-5e25-43c3-88b5-e878bdc56328'
};
export const ADDRESS_2_MOCK = {
  id: 'FF_AB_6291084a-e944-465d-8cdd-c9b40bec9ace'
};
export const FOOD_CATEGORY_MOCK = {
  id: 'FF_FC_c0d2925e-58f1-4388-b7f8-a578b2266433'
};
export const MENU_ITEM_MOCK = {
  id: 'FF_MENU_ITEM_10d5f687-8f07-45f9-aa29-8a552956391f'
};
export const MENU_ITEM_VARIANT_MOCK = {
  id: 'FF_MENU_ITEM_VARIANT_57a31677-ada6-484b-b706-291b71bd613d'
};
export const SUPER_ADMIN_MOCK = {
  admin_id: 'FF_ADMIN_ea42a109-ec7a-4014-ada2-a050c9e817ed',
  user_id: 'USR_dfdb430a-4506-401f-8242-634ea8d9735e',
  email: 'superadmin@gmail.com'
};
export const FINANCE_ADMIN_MOCK = {
  email: 'financeadmin_c6f3a1e0@flashfood.com',
  admin_id: 'FF_ADMIN_815e87f7-1bd3-4926-9c0e-19870f500d74',
  user_id: 'USR_8f730d82-edee-44de-8e5f-283191c00c65'
};
export const COMPANION_ADMIN_MOCK = {
  admin_id: 'FF_ADMIN_f5b1df0b-7427-4d37-8b6c-46cd08b65a71',
  user_id: 'USR_f9adc293-4ebd-40e5-b6e4-8e41ca84a677',
  email: 'companionadmin_db4e45ce@flashfood.com'
};
export const CUSTOMER_CARE_MOCK = {
  customer_care_id: 'FF_CC_320571da-59d0-483a-9c39-912d2a72b256',
  user_id: 'USR_a54d53f3-239c-4a21-83ac-20d7cfd1c150'
};
export const DRIVER_MOCK = {
  driver_id: 'FF_DRI_d561f2ba-b3a8-4190-8221-ec2a86c85010',
  user_id: 'USR_4eb1f0c4-1025-4de3-b210-b942ffbf77aa'
};
