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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_repository_1 = require("../users/users.repository");
const customers_repository_1 = require("../customers/customers.repository");
const drivers_repository_1 = require("../drivers/drivers.repository");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const customer_cares_repository_1 = require("../customer_cares/customer_cares.repository");
const email_service_1 = require("../mailer/email.service");
const admin_service_1 = require("../admin/admin.service");
const uuid_1 = require("uuid");
const bcryptjs = __importStar(require("bcryptjs"));
const createResponse_1 = require("../utils/createResponse");
const Payload_1 = require("../types/Payload");
const admin_1 = require("../utils/types/admin");
const cart_items_service_1 = require("../cart_items/cart_items.service");
let AuthService = class AuthService {
    constructor(userRepository, fWalletsRepository, restaurantsRepository, customersRepository, driverRepository, customerCareRepository, adminService, jwtService, emailService, cartItemService) {
        this.userRepository = userRepository;
        this.fWalletsRepository = fWalletsRepository;
        this.restaurantsRepository = restaurantsRepository;
        this.customersRepository = customersRepository;
        this.driverRepository = driverRepository;
        this.customerCareRepository = customerCareRepository;
        this.adminService = adminService;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.cartItemService = cartItemService;
    }
    async register(userData, type) {
        console.log('Starting registration process with data:', { userData, type });
        const { email, password, phone } = userData;
        console.log('Extracted credentials:', { email, phone });
        if (!this.validateRegistrationInput(email, password)) {
            console.log('Registration validation failed - missing email or password');
            return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Email & Password cannot be empty');
        }
        console.log('Registration input validation passed');
        const existingUser = await this.findUserByEmail(email);
        console.log('Existing user check result:', { exists: !!existingUser });
        if (existingUser) {
            console.log('Found existing user, handling existing user registration');
            return this.handleExistingUserRegistration(existingUser, userData, type);
        }
        console.log('No existing user found, creating new registration');
        return this.createNewUserRegistration(userData, type, phone);
    }
    async login({ email, password }, type) {
        if (!this.validateLoginInput(email, password)) {
            return (0, createResponse_1.createResponse)('MissingInput', null, 'Email & Password cannot be empty');
        }
        const user = await this.validateUserCredentials(email, password);
        if (!user) {
            return (0, createResponse_1.createResponse)('Unauthorized', null, 'Invalid credentials');
        }
        const basePayload = this.createBasePayload(user);
        return this.handleUserTypeLogin(user, type, basePayload);
    }
    async validateRegistrationInput(email, password) {
        return Boolean(email && password);
    }
    async validateLoginInput(email, password) {
        return Boolean(email && password);
    }
    async findUserByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async validateUserCredentials(email, password) {
        const user = await this.findUserByEmail(email);
        if (!user)
            return null;
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid)
            return null;
        return user;
    }
    createBasePayload(user) {
        return {
            user_id: user.id,
            email: user.email,
            user_type: user.user_type,
            first_name: user.first_name,
            last_name: user.last_name,
            app_preferences: user.app_preferences
        };
    }
    async handleUserTypeLogin(user, type, basePayload) {
        const loginHandlers = {
            DRIVER: () => this.handleDriverLogin(user, basePayload),
            CUSTOMER: () => this.handleCustomerLogin(user, basePayload),
            F_WALLET: () => this.handleFWalletLogin(user, basePayload),
            RESTAURANT_OWNER: () => this.handleRestaurantOwnerLogin(user, basePayload),
            CUSTOMER_CARE_REPRESENTATIVE: () => this.handleCustomerCareLogin(user, basePayload),
            SUPER_ADMIN: () => this.handleAdminLogin(user, basePayload, Payload_1.Enum_UserType.SUPER_ADMIN),
            FINANCE_ADMIN: () => this.handleAdminLogin(user, basePayload, Payload_1.Enum_UserType.FINANCE_ADMIN),
            COMPANION_ADMIN: () => this.handleAdminLogin(user, basePayload, Payload_1.Enum_UserType.COMPANION_ADMIN)
        };
        const handler = loginHandlers[type];
        if (!handler) {
            return (0, createResponse_1.createResponse)('Unauthorized', null, 'Invalid user type');
        }
        return handler();
    }
    async handleDriverLogin(user, basePayload) {
        const userWithRole = await this.driverRepository.findOne({
            user_id: user.id
        });
        if (!userWithRole) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Driver not found');
        }
        const fWalletData = await this.fWalletsRepository.findByUserId(user.id);
        if (!fWalletData) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Driver not found');
        }
        const driverPayload = {
            ...basePayload,
            id: userWithRole.id,
            logged_in_as: Payload_1.Enum_UserType.DRIVER,
            user_id: userWithRole.user_id,
            first_name: userWithRole.first_name,
            last_name: userWithRole.last_name,
            driver_id: userWithRole.id,
            contact_email: userWithRole.contact_email,
            contact_phone: userWithRole.contact_phone,
            vehicle: userWithRole.vehicle,
            current_location: userWithRole.current_location,
            avatar: userWithRole.avatar,
            available_for_work: userWithRole.available_for_work,
            fWallet_id: fWalletData.id,
            fWallet_balance: fWalletData.balance
        };
        const accessToken = this.jwtService.sign(driverPayload);
        return (0, createResponse_1.createResponse)('OK', {
            access_token: accessToken,
            user_data: userWithRole
        }, 'Login successful');
    }
    async handleCustomerLogin(user, basePayload) {
        try {
            console.log('check user', user, 'chekc user id', user.id);
            const userWithRole = await Promise.race([
                this.customersRepository.findByUserId(user.id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Customer lookup timeout')), 2000))
            ]);
            if (!userWithRole) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            const fwallet = await Promise.race([
                this.fWalletsRepository.findByUserId(user.id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Wallet lookup timeout')), 5000))
            ]);
            if (!fwallet) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found for customer');
            }
            const cartItems = await Promise.race([
                this.cartItemService.findAll({
                    customer_id: userWithRole.id
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Cart items lookup timeout')), 5000))
            ]);
            await this.customersRepository.update(userWithRole.id, {
                last_login: Math.floor(Date.now() / 1000)
            });
            const customerPayload = {
                ...basePayload,
                id: userWithRole.id,
                logged_in_as: Payload_1.Enum_UserType.CUSTOMER,
                fWallet_id: fwallet.id,
                fWallet_balance: fwallet.balance,
                preferred_category: userWithRole.preferred_category,
                favorite_restaurants: userWithRole.favorite_restaurants || [],
                favorite_items: userWithRole.favorite_items || [],
                user_id: user.id,
                avatar: userWithRole.avatar,
                support_tickets: userWithRole.support_tickets || [],
                address: userWithRole.address || {},
                cart_items: cartItems?.data || []
            };
            const accessToken = this.jwtService.sign(customerPayload);
            return (0, createResponse_1.createResponse)('OK', {
                access_token: accessToken,
                user_data: userWithRole
            }, 'Login successful');
        }
        catch (error) {
            console.error('Error in handleCustomerLogin:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Login failed due to server error');
        }
    }
    async handleFWalletLogin(user, basePayload) {
        const userWithRole = await this.fWalletsRepository.findByUserId(user.id);
        if (!userWithRole) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'FWallet not found');
        }
        const fWalletPayload = {
            ...basePayload,
            id: userWithRole.id,
            logged_in_as: Payload_1.Enum_UserType.F_WALLET,
            user_id: userWithRole.user_id,
            balance: userWithRole.balance,
            fWallet_id: userWithRole.id
        };
        const accessToken = this.jwtService.sign(fWalletPayload);
        return (0, createResponse_1.createResponse)('OK', { access_token: accessToken }, 'Login successful');
    }
    async handleRestaurantOwnerLogin(user, basePayload) {
        try {
            const userWithRole = await this.restaurantsRepository.findByOwnerId(user.id);
            if (!userWithRole) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Restaurant owner not found');
            }
            const fwallet = await this.fWalletsRepository.findByUserId(user.id);
            const restaurantPayload = {
                ...basePayload,
                id: userWithRole.id,
                logged_in_as: Payload_1.Enum_UserType.RESTAURANT_OWNER,
                owner_id: userWithRole.owner_id,
                owner_name: userWithRole.owner_name,
                restaurant_id: userWithRole.id ?? userWithRole.id,
                address: userWithRole.address,
                restaurant_name: userWithRole.restaurant_name,
                contact_email: userWithRole.contact_email,
                contact_phone: userWithRole.contact_phone,
                created_at: userWithRole.created_at,
                updated_at: userWithRole.updated_at,
                avatar: userWithRole.avatar,
                images_gallery: userWithRole.images_gallery,
                status: userWithRole.status,
                ratings: userWithRole.ratings,
                opening_hours: userWithRole.opening_hours,
                fWallet_id: fwallet?.id,
                fWallet_balance: fwallet?.balance
            };
            if (userWithRole.specialize_in) {
                restaurantPayload['specialize_in'] = userWithRole.specialize_in;
            }
            const accessToken = this.jwtService.sign(restaurantPayload);
            return (0, createResponse_1.createResponse)('OK', {
                access_token: accessToken,
                user_data: userWithRole
            }, 'Login successful');
        }
        catch (error) {
            console.error('Error in restaurant owner login:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Login failed due to server error');
        }
    }
    async handleCustomerCareLogin(user, basePayload) {
        const userWithRole = await this.customerCareRepository.findByUserId(user.id);
        if (!userWithRole) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Customer Care representative not found');
        }
        const customerCarePayload = {
            ...basePayload,
            id: userWithRole.id,
            logged_in_as: Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE,
            user_id: userWithRole.user_id,
            first_name: userWithRole.first_name,
            last_name: userWithRole.last_name,
            contact_email: userWithRole.contact_email,
            contact_phone: userWithRole.contact_phone,
            assigned_tickets: userWithRole.assigned_tickets,
            avatar: userWithRole.avatar,
            available_for_work: userWithRole.available_for_work,
            is_assigned: userWithRole.is_assigned
        };
        const accessToken = this.jwtService.sign(customerCarePayload);
        return (0, createResponse_1.createResponse)('OK', {
            access_token: accessToken,
            user_data: userWithRole
        }, 'Login successful');
    }
    async handleAdminLogin(user, basePayload, type) {
        const admin = await this.adminService.findOneByUserId(user.id);
        if (!admin.data) {
            return (0, createResponse_1.createResponse)('NotFound', null, `${type} not found`);
        }
        const adminPayload = {
            ...basePayload,
            id: admin.data.id,
            logged_in_as: type,
            user_id: admin.data.user_id,
            role: admin.data.role,
            avatar: admin.data.avatar,
            permissions: admin.data.permissions,
            assigned_restaurants: admin.data.assigned_restaurants,
            assigned_drivers: admin.data.assigned_drivers,
            assigned_customer_care: admin.data.assigned_customer_care,
            penalties_issued: admin.data.penalties_issued,
            last_active: admin.data.last_active,
            created_at: admin.data.created_at,
            updated_at: admin.data.updated_at,
            created_by: admin.data.created_by,
            status: admin.data.status
        };
        const accessToken = this.jwtService.sign(adminPayload);
        return (0, createResponse_1.createResponse)('OK', {
            access_token: accessToken,
            user_data: admin.data
        }, 'Admin login successful');
    }
    async handleExistingUserRegistration(existingUser, userData, type) {
        if (existingUser && Array.isArray(existingUser.user_type)) {
            const userTypes = existingUser.user_type.map(t => String(t));
            if (userTypes.includes(String(type))) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, `${type} with the same email already exists`);
            }
        }
        let newUserWithRole;
        let fWallet;
        switch (type) {
            case Payload_1.Enum_UserType.CUSTOMER:
                newUserWithRole = await this.customersRepository.create({
                    ...userData,
                    password: existingUser.password,
                    user_id: existingUser.id
                });
                break;
            case Payload_1.Enum_UserType.DRIVER:
                fWallet = await this.fWalletsRepository.findByUserId(existingUser.id);
                if (!fWallet) {
                    fWallet = await this.fWalletsRepository.create({
                        ...userData,
                        password: existingUser.password,
                        user_id: existingUser.id,
                        balance: 0
                    });
                    if (!existingUser.user_type.includes(Payload_1.Enum_UserType.F_WALLET)) {
                        existingUser.user_type.push(Payload_1.Enum_UserType.F_WALLET);
                    }
                }
                newUserWithRole = await this.driverRepository.create({
                    user_id: existingUser.id,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    contact_email: [
                        { title: 'Primary', is_default: true, email: userData.email }
                    ],
                    contact_phone: [
                        { title: 'Primary', is_default: true, number: userData.phone }
                    ],
                    available_for_work: false,
                    is_on_delivery: false,
                    active_points: 0,
                    current_order_id: [],
                    vehicle: {
                        license_plate: '',
                        model: '',
                        color: ''
                    },
                    current_location: {
                        lat: 0,
                        lng: 0
                    },
                    rating: {
                        average_rating: 0,
                        review_count: 0
                    }
                });
                const createdDriver = await this.driverRepository.findOne({
                    where: { id: newUserWithRole.id },
                    relations: ['current_orders']
                });
                if (!createdDriver) {
                    throw new Error('Failed to retrieve created driver');
                }
                if (!existingUser.user_type.includes(Payload_1.Enum_UserType.F_WALLET)) {
                    const updatedUserTypes = [
                        ...existingUser.user_type,
                        Payload_1.Enum_UserType.F_WALLET
                    ];
                    await this.userRepository.update(existingUser.id, {
                        user_type: updatedUserTypes,
                        verification_code: existingUser.verification_code?.toString()
                    });
                    existingUser.user_type = updatedUserTypes;
                }
                return (0, createResponse_1.createResponse)('OK', {
                    id: existingUser.id,
                    user_id: existingUser.id,
                    email: existingUser.email,
                    first_name: existingUser.first_name,
                    last_name: existingUser.last_name,
                    user_type: existingUser.user_type,
                    data: createdDriver,
                    fWallet: fWallet
                }, 'Driver registered successfully');
            case Payload_1.Enum_UserType.RESTAURANT_OWNER:
                console.log('=== Starting Restaurant Owner Registration ===');
                try {
                    const fWalletData = {
                        user_id: existingUser.id,
                        email: existingUser.email,
                        password: existingUser.password,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        balance: 0
                    };
                    console.log('Creating FWallet with data:', fWalletData);
                    fWallet = await this.fWalletsRepository.create(fWalletData);
                    console.log('FWallet created successfully:', fWallet);
                    const restaurantData = {
                        owner_id: existingUser.id,
                        owner_name: userData.owner_name,
                        restaurant_name: userData.restaurant_name,
                        contact_email: userData.contact_email || [
                            { title: 'Primary', is_default: true, email: userData.email }
                        ],
                        contact_phone: userData.contact_phone || [
                            {
                                title: 'Primary',
                                is_default: true,
                                number: userData.phone || ''
                            }
                        ],
                        status: userData.status || {
                            is_open: false,
                            is_active: false,
                            is_accepted_orders: false
                        },
                        opening_hours: userData.opening_hours || {
                            mon: { from: 8, to: 17 },
                            tue: { from: 8, to: 17 },
                            wed: { from: 8, to: 17 },
                            thu: { from: 8, to: 17 },
                            fri: { from: 8, to: 17 },
                            sat: { from: 8, to: 17 },
                            sun: { from: 8, to: 17 }
                        },
                        address_id: userData.address_id,
                        food_category_ids: userData?.food_category_ids || []
                    };
                    console.log('Creating restaurant with data:', restaurantData);
                    const restaurantResult = await this.restaurantsRepository.create(restaurantData);
                    console.log('Restaurant creation result:', restaurantResult);
                    if (restaurantResult.EC === -2) {
                        await this.fWalletsRepository.delete(fWallet.id);
                        await this.userRepository.delete(existingUser.id);
                        return (0, createResponse_1.createResponse)('NotFound', null, restaurantResult.EM || 'Failed to create restaurant');
                    }
                    newUserWithRole = restaurantResult.data;
                    if (newUserWithRole && fWallet) {
                        console.log('Both FWallet and Restaurant created, updating user type');
                        const updatedUserTypes = [...existingUser.user_type];
                        if (!updatedUserTypes.includes(Payload_1.Enum_UserType.F_WALLET)) {
                            updatedUserTypes.push(Payload_1.Enum_UserType.F_WALLET);
                        }
                        await this.userRepository.update(existingUser.id, {
                            user_type: updatedUserTypes,
                            verification_code: existingUser.verification_code?.toString()
                        });
                        existingUser.user_type = updatedUserTypes;
                    }
                }
                catch (error) {
                    console.error('Error in restaurant owner registration:', error);
                    if (fWallet) {
                        await this.fWalletsRepository.delete(fWallet.id);
                    }
                    await this.userRepository.delete(existingUser.id);
                    throw error;
                }
                break;
            case Payload_1.Enum_UserType.F_WALLET:
                newUserWithRole = await this.fWalletsRepository.create({
                    ...userData,
                    password: existingUser.password,
                    user_id: existingUser.id,
                    balance: 0
                });
                break;
            case Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE:
                newUserWithRole = await this.customerCareRepository.create({
                    user_id: existingUser.id,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    contact_email: [
                        { title: 'Primary', is_default: true, email: userData.email }
                    ],
                    contact_phone: [
                        { title: 'Primary', is_default: true, number: userData.phone }
                    ],
                    assigned_tickets: [],
                    available_for_work: false,
                    is_assigned: false,
                    created_at: Math.floor(Date.now() / 1000),
                    updated_at: Math.floor(Date.now() / 1000),
                    last_login: Math.floor(Date.now() / 1000)
                });
                break;
            case Payload_1.Enum_UserType.SUPER_ADMIN:
            case Payload_1.Enum_UserType.FINANCE_ADMIN:
            case Payload_1.Enum_UserType.COMPANION_ADMIN:
                const roleMap = {
                    [Payload_1.Enum_UserType.SUPER_ADMIN]: admin_1.AdminRole.SUPER_ADMIN,
                    [Payload_1.Enum_UserType.FINANCE_ADMIN]: admin_1.AdminRole.FINANCE_ADMIN,
                    [Payload_1.Enum_UserType.COMPANION_ADMIN]: admin_1.AdminRole.COMPANION_ADMIN
                };
                const role = roleMap[type];
                newUserWithRole = await this.adminService.create({
                    user_id: existingUser.id,
                    role,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    permissions: [],
                    status: admin_1.AdminStatus.ACTIVE,
                    created_at: Math.floor(Date.now() / 1000),
                    updated_at: Math.floor(Date.now() / 1000)
                });
                if (newUserWithRole.EC !== 'OK') {
                    return newUserWithRole;
                }
                newUserWithRole = newUserWithRole.data;
                break;
            default:
                return (0, createResponse_1.createResponse)('Unauthorized', null, 'Invalid user type provided');
        }
        switch (type) {
            case Payload_1.Enum_UserType.CUSTOMER:
                await this.customersRepository.update(newUserWithRole.id, newUserWithRole);
                break;
            case Payload_1.Enum_UserType.DRIVER:
                await this.driverRepository.update(newUserWithRole.id, newUserWithRole);
                break;
            case Payload_1.Enum_UserType.RESTAURANT_OWNER:
                await this.restaurantsRepository.update(newUserWithRole.id, newUserWithRole);
                break;
            case Payload_1.Enum_UserType.F_WALLET:
                await this.fWalletsRepository.update(newUserWithRole.id, newUserWithRole);
                break;
        }
        if (!existingUser.user_type.includes(type)) {
            const updatedUserTypes = [...existingUser.user_type, type];
            await this.userRepository.update(existingUser.id, {
                user_type: updatedUserTypes,
                verification_code: existingUser.verification_code?.toString()
            });
            existingUser.user_type = updatedUserTypes;
        }
        const responseData = {
            id: existingUser.id,
            user_id: existingUser.id,
            email: existingUser.email,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            user_type: existingUser.user_type,
            data: newUserWithRole
        };
        if (fWallet &&
            (type === Payload_1.Enum_UserType.DRIVER ||
                type === Payload_1.Enum_UserType.RESTAURANT_OWNER)) {
            responseData['fWallet'] = fWallet;
        }
        return (0, createResponse_1.createResponse)('OK', responseData, `${type} created successfully with existing user`);
    }
    async createNewUserRegistration(userData, type, phone) {
        console.log('=== Starting createNewUserRegistration ===');
        console.log('Input data:', { userData, type, phone });
        const { email, password, first_name, last_name } = userData;
        console.log('Extracted user data:', { email, first_name, last_name });
        if (!this.validateRegistrationInput(email, password)) {
            console.log('Registration validation failed');
            return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Email & Password cannot be empty');
        }
        try {
            console.log('Creating new user with data:', {
                email,
                phone,
                first_name,
                last_name,
                type
            });
            const newUserData = {
                id: `USR_${(0, uuid_1.v4)()}`,
                email,
                phone,
                password: await bcryptjs.hash(password, 10),
                first_name: userData.first_name,
                last_name: userData.last_name,
                verification_code: Math.floor(Math.random() * 1000000),
                is_verified: false,
                created_at: new Date(),
                updated_at: new Date(),
                user_type: [type]
            };
            console.log('Creating user with data:', newUserData);
            const newUser = await this.userRepository.create(newUserData);
            console.log('User created successfully:', newUser);
            let newUserWithRole;
            let fWallet;
            switch (type) {
                case Payload_1.Enum_UserType.CUSTOMER:
                    console.log('=== Starting Customer Registration ===');
                    try {
                        const customerFWalletData = {
                            user_id: newUser.id,
                            email: newUser.email,
                            password: newUserData.password,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            balance: 0
                        };
                        console.log('Creating FWallet with data:', customerFWalletData);
                        fWallet = await this.fWalletsRepository.create(customerFWalletData);
                        console.log('FWallet created successfully:', fWallet);
                        const customerData = {
                            user_id: newUser.id,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            phone: userData.phone,
                            address: userData.address || {},
                            created_at: Math.floor(Date.now() / 1000),
                            updated_at: Math.floor(Date.now() / 1000)
                        };
                        console.log('Creating customer with data:', customerData);
                        newUserWithRole =
                            await this.customersRepository.create(customerData);
                        console.log('Customer created successfully:', newUserWithRole);
                        if (newUserWithRole && fWallet) {
                            console.log('Both FWallet and Customer created, updating user type');
                            const updatedUserTypes = [...newUser.user_type];
                            if (!updatedUserTypes.includes(Payload_1.Enum_UserType.F_WALLET)) {
                                updatedUserTypes.push(Payload_1.Enum_UserType.F_WALLET);
                            }
                            await this.userRepository.update(newUser.id, {
                                user_type: updatedUserTypes,
                                verification_code: newUser.verification_code?.toString()
                            });
                            newUser.user_type = updatedUserTypes;
                        }
                    }
                    catch (error) {
                        console.error('Error in customer registration:', error);
                        if (fWallet) {
                            await this.fWalletsRepository.delete(fWallet.id);
                        }
                        await this.userRepository.delete(newUser.id);
                        throw error;
                    }
                    break;
                case Payload_1.Enum_UserType.DRIVER:
                    console.log('=== Starting Driver Registration ===');
                    try {
                        const driverFWalletData = {
                            user_id: newUser.id,
                            email: newUser.email,
                            password: newUserData.password,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            balance: 0
                        };
                        console.log('Creating FWallet with data:', driverFWalletData);
                        fWallet = await this.fWalletsRepository.create(driverFWalletData);
                        console.log('FWallet created successfully:', fWallet);
                        const driverData = {
                            user_id: newUser.id,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            contact_email: [
                                { title: 'Primary', is_default: true, email: userData.email }
                            ],
                            contact_phone: [
                                { title: 'Primary', is_default: true, number: userData.phone }
                            ],
                            available_for_work: false,
                            is_on_delivery: false,
                            active_points: 0,
                            current_order_id: [],
                            vehicle: {
                                license_plate: '',
                                model: '',
                                color: ''
                            },
                            current_location: {
                                lat: 0,
                                lng: 0
                            },
                            rating: {
                                average_rating: 0,
                                review_count: 0
                            }
                        };
                        console.log('Creating driver with data:', driverData);
                        newUserWithRole = await this.driverRepository.create(driverData);
                        console.log('Driver created successfully:', newUserWithRole);
                        if (newUserWithRole && fWallet) {
                            console.log('Both FWallet and Driver created, updating user type');
                            const updatedUserTypes = [...newUser.user_type];
                            if (!updatedUserTypes.includes(Payload_1.Enum_UserType.F_WALLET)) {
                                updatedUserTypes.push(Payload_1.Enum_UserType.F_WALLET);
                            }
                            await this.userRepository.update(newUser.id, {
                                user_type: updatedUserTypes,
                                verification_code: newUser.verification_code?.toString()
                            });
                            newUser.user_type = updatedUserTypes;
                        }
                        return (0, createResponse_1.createResponse)('OK', {
                            id: newUser.id,
                            user_id: newUser.id,
                            phone,
                            email: newUser.email,
                            first_name: newUser.first_name,
                            last_name: newUser.last_name,
                            user_type: newUser.user_type,
                            data: newUserWithRole,
                            fWallet: fWallet
                        }, 'Driver registered successfully');
                    }
                    catch (error) {
                        console.error('Error in driver registration:', error);
                        throw error;
                    }
                    break;
                case Payload_1.Enum_UserType.RESTAURANT_OWNER:
                    console.log('=== Starting Restaurant Owner Registration ===');
                    try {
                        const fWalletData = {
                            user_id: newUser.id,
                            email: newUser.email,
                            password: newUserData.password,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            balance: 0
                        };
                        console.log('Creating FWallet with data:', fWalletData);
                        fWallet = await this.fWalletsRepository.create(fWalletData);
                        console.log('FWallet created successfully:', fWallet);
                        const restaurantData = {
                            owner_id: newUser.id,
                            owner_name: userData.owner_name,
                            restaurant_name: userData.restaurant_name,
                            contact_email: userData.contact_email || [
                                { title: 'Primary', is_default: true, email: userData.email }
                            ],
                            contact_phone: userData.contact_phone || [
                                {
                                    title: 'Primary',
                                    is_default: true,
                                    number: userData.phone || ''
                                }
                            ],
                            status: userData.status || {
                                is_open: false,
                                is_active: false,
                                is_accepted_orders: false
                            },
                            opening_hours: userData.opening_hours || {
                                mon: { from: 8, to: 17 },
                                tue: { from: 8, to: 17 },
                                wed: { from: 8, to: 17 },
                                thu: { from: 8, to: 17 },
                                fri: { from: 8, to: 17 },
                                sat: { from: 8, to: 17 },
                                sun: { from: 8, to: 17 }
                            },
                            address_id: userData.address_id,
                            food_category_ids: userData?.food_category_ids || []
                        };
                        console.log('Creating restaurant with data:', restaurantData);
                        const restaurantResult = await this.restaurantsRepository.create(restaurantData);
                        console.log('Restaurant creation result:', restaurantResult);
                        if (restaurantResult.EC === -2) {
                            await this.fWalletsRepository.delete(fWallet.id);
                            await this.userRepository.delete(newUser.id);
                            return (0, createResponse_1.createResponse)('NotFound', null, restaurantResult.EM || 'Failed to create restaurant');
                        }
                        newUserWithRole = restaurantResult.data;
                        if (newUserWithRole && fWallet) {
                            console.log('Both FWallet and Restaurant created, updating user type');
                            const updatedUserTypes = [...newUser.user_type];
                            if (!updatedUserTypes.includes(Payload_1.Enum_UserType.F_WALLET)) {
                                updatedUserTypes.push(Payload_1.Enum_UserType.F_WALLET);
                            }
                            await this.userRepository.update(newUser.id, {
                                user_type: updatedUserTypes,
                                verification_code: newUser.verification_code?.toString()
                            });
                            newUser.user_type = updatedUserTypes;
                        }
                    }
                    catch (error) {
                        console.error('Error in restaurant owner registration:', error);
                        if (fWallet) {
                            await this.fWalletsRepository.delete(fWallet.id);
                        }
                        await this.userRepository.delete(newUser.id);
                        throw error;
                    }
                    break;
                case Payload_1.Enum_UserType.F_WALLET:
                    newUserWithRole = await this.fWalletsRepository.create({
                        ...userData,
                        password: newUserData.password,
                        user_id: newUser.id,
                        balance: 0
                    });
                    break;
                case Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE:
                    newUserWithRole = await this.customerCareRepository.create({
                        user_id: newUser.id,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        contact_email: [
                            { title: 'Primary', is_default: true, email: userData.email }
                        ],
                        contact_phone: [
                            { title: 'Primary', is_default: true, number: userData.phone }
                        ],
                        assigned_tickets: [],
                        available_for_work: false,
                        is_assigned: false,
                        created_at: Math.floor(Date.now() / 1000),
                        updated_at: Math.floor(Date.now() / 1000),
                        last_login: Math.floor(Date.now() / 1000)
                    });
                    break;
                case Payload_1.Enum_UserType.SUPER_ADMIN:
                case Payload_1.Enum_UserType.FINANCE_ADMIN:
                case Payload_1.Enum_UserType.COMPANION_ADMIN:
                    const roleMap = {
                        [Payload_1.Enum_UserType.SUPER_ADMIN]: admin_1.AdminRole.SUPER_ADMIN,
                        [Payload_1.Enum_UserType.FINANCE_ADMIN]: admin_1.AdminRole.FINANCE_ADMIN,
                        [Payload_1.Enum_UserType.COMPANION_ADMIN]: admin_1.AdminRole.COMPANION_ADMIN
                    };
                    const role = roleMap[type];
                    newUserWithRole = await this.adminService.create({
                        user_id: newUser.id,
                        role,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        permissions: [],
                        status: admin_1.AdminStatus.ACTIVE,
                        created_at: Math.floor(Date.now() / 1000),
                        updated_at: Math.floor(Date.now() / 1000)
                    });
                    if (newUserWithRole.EC !== 'OK') {
                        return newUserWithRole;
                    }
                    newUserWithRole = newUserWithRole.data;
                    break;
                default:
                    return (0, createResponse_1.createResponse)('Unauthorized', null, 'Invalid user type provided');
            }
            console.log('=== Registration Complete ===');
            console.log('Final user data:', newUser);
            console.log('Role-specific data:', newUserWithRole);
            console.log('FWallet data:', fWallet);
            const responseData = {
                id: newUser.id,
                user_id: newUser.id,
                phone,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                user_type: newUser.user_type,
                data: newUserWithRole
            };
            if (fWallet &&
                (type === Payload_1.Enum_UserType.DRIVER ||
                    type === Payload_1.Enum_UserType.RESTAURANT_OWNER)) {
                responseData['fWallet'] = fWallet;
            }
            return (0, createResponse_1.createResponse)('OK', responseData, `${type} registered successfully`);
        }
        catch (error) {
            console.error('Error in createNewUserRegistration:', error);
            throw error;
        }
    }
    async validateUser(payload) {
        return this.userRepository.findById(payload.userId);
    }
    async hasRole(userId, role) {
        const user = await this.userRepository.findById(userId);
        return user?.user_type.includes(role) || false;
    }
    async requestPasswordReset(email) {
        const user = await this.findUserByEmail(email);
        if (!user) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'User with this email not found');
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepository.update(user.id, {
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry
        });
        await this.emailService.sendPasswordResetEmail(email, resetToken, `${user.first_name} ${user.last_name}`);
        return (0, createResponse_1.createResponse)('OK', null, 'Password reset email sent successfully');
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { reset_token: token }
        });
        if (!user) {
            return (0, createResponse_1.createResponse)('Unauthorized', null, 'Invalid or expired token');
        }
        if (user.reset_token_expiry < new Date()) {
            return (0, createResponse_1.createResponse)('Unauthorized', null, 'Token has expired');
        }
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await this.userRepository.update(user.id, {
            password: hashedPassword,
            reset_token: null,
            reset_token_expiry: null
        });
        return (0, createResponse_1.createResponse)('OK', null, 'Password reset successfully');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UserRepository,
        fwallets_repository_1.FWalletsRepository,
        restaurants_repository_1.RestaurantsRepository,
        customers_repository_1.CustomersRepository,
        drivers_repository_1.DriversRepository,
        customer_cares_repository_1.CustomerCaresRepository,
        admin_service_1.AdminService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        cart_items_service_1.CartItemsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map