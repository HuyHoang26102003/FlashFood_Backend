import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { RestaurantsService } from '../../restaurants/restaurants.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
// import { CreateRestaurantDto } from '../../restaurants/dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../../restaurants/dto/update-restaurant.dto';
import { AdminRole } from 'src/utils/types/admin';
import { CreateRestaurantSignup } from 'src/restaurants/dto/create-restaurant.dto';
import { createCustomerSignup } from 'src/customers/dto/create-customer.dto';
import { createDriverSignup } from 'src/drivers/dto/create-driver.dto';
import { createCustomerCareSignup } from 'src/customer_cares/dto/create-customer_cares.dto';
import { CustomersService } from 'src/customers/customers.service';
import { DriversService } from 'src/drivers/drivers.service';
import { CustomerCareService } from 'src/customer_cares/customer_cares.service';
import { generateRandomEmail } from 'src/utils/commonFunctions';
import { AuthService } from 'src/auth/auth.service';
import { Enum_UserType } from 'src/types/Payload';
import { User } from 'src/users/entities/user.entity';
import { AddressBookService } from 'src/address_book/address_book.service';
// import { createClient } from 'redis';
import { RedisService } from 'src/redis/redis.service';
import { OrdersService } from 'src/orders/orders.service';
import {
  ADDRESS_1_MOCK,
  ADDRESS_2_MOCK,
  CUSTOMER_MOCK,
  MENU_ITEM_MOCK,
  MENU_ITEM_VARIANT_MOCK,
  RESTAURANT_MOCK
} from 'src/utils/constants';
import { CustomerCareInquiriesService } from 'src/customer_cares_inquires/customer_cares_inquires.service';

// const redis = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

@Controller('companion-admin')
export class CompanionAdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly customerCareInquiriesService: CustomerCareInquiriesService,
    private readonly orderService: OrdersService,
    private readonly restaurantService: RestaurantsService,
    private readonly customerService: CustomersService,
    private readonly driverService: DriversService,
    private readonly customerCareService: CustomerCareService,
    private readonly authService: AuthService,
    private readonly addressBookService: AddressBookService,
    private readonly redisService: RedisService // Thêm RedisService
  ) {}

  // Admin Management Endpoints
  @Post()
  createCompanionAdmin(@Body() createAdminDto: CreateAdminDto) {
    // Force the role to be COMPANION_ADMIN
    createAdminDto.role = AdminRole.COMPANION_ADMIN;
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAllCompanionAdmins() {
    // This should be modified in the service to filter only COMPANION_ADMIN roles
    return this.adminService.findAll();
  }

  // Restaurant Management Endpoints
  @Get('/restaurants')
  findAllRestaurants() {
    return this.restaurantService.findAll();
  }

  @Post('/restaurants')
  async createRestaurant() {
    // Keep generating email until we find an unused one
    let emailData;
    let existingUser;

    do {
      emailData = generateRandomEmail();
      existingUser = await this.authService.findUserByEmail(emailData.email);
    } while (existingUser);

    // Create an address book entry first
    const addressBook = await this.addressBookService.create({
      street: '123 Restaurant St',
      city: 'Restaurant City',
      nationality: 'Restaurant Country',
      postal_code: 70000,
      location: { lat: 1.234567, lng: 7.891011 },
      is_default: true,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      title: 'Main'
    });

    // Create restaurant signup data with the unique email
    const createRestaurantDto: CreateRestaurantSignup = {
      first_name: emailData.fullName.first_name,
      last_name: emailData.fullName.last_name,
      email: emailData.email,
      password: '000000', // Consider generating a random password
      phone: '1234567890',
      address_id: addressBook.data.id,
      owner_id: '1234567890',
      owner_name: `${emailData.fullName.first_name} ${emailData.fullName.last_name}`,
      restaurant_name: emailData.fullName.prefixEmail,
      contact_email: [
        {
          title: 'Main',
          email: emailData.email,
          is_default: true
        }
      ],
      contact_phone: [
        {
          title: 'Main',
          number: '1234567890',
          is_default: true
        }
      ],
      status: {
        is_open: true,
        is_active: true,
        is_accepted_orders: true
      },
      opening_hours: {
        mon: { from: 9, to: 17 },
        tue: { from: 9, to: 17 },
        wed: { from: 9, to: 17 },
        thu: { from: 9, to: 17 },
        fri: { from: 9, to: 17 },
        sat: { from: 9, to: 17 },
        sun: { from: 9, to: 17 }
      }
    };

    // Register the new restaurant owner through auth service
    const registrationResult = await this.authService.register(
      createRestaurantDto,
      Enum_UserType.RESTAURANT_OWNER
    );

    return registrationResult;
  }

  @Get('/customers')
  findAllCustomers() {
    return this.customerService.findAll();
  }

  @Post('/customers')
  async createCustomer() {
    let emailData;
    let existingUser;

    do {
      emailData = generateRandomEmail();
      existingUser = await this.authService.findUserByEmail(emailData.email);
    } while (existingUser);

    // Create an address book entry first
    const addressBook = await this.addressBookService.create({
      street: '123 Customer St',
      city: 'Customer City',
      nationality: 'Customer Country',
      postal_code: 70000,
      location: { lat: 1.234567, lng: 7.891011 },
      is_default: true,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      title: 'Main'
    });

    const createCustomerDto: createCustomerSignup = {
      first_name: emailData.fullName.first_name,
      last_name: emailData.fullName.last_name,
      email: emailData.email,
      password: '000000',
      phone: '1234567890',
      address: addressBook.data.id,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      user_id: '1234567890'
    };
    const registrationResult = await this.authService.register(
      createCustomerDto,
      Enum_UserType.CUSTOMER
    );
    await this.redisService.del('customers:all'); // Xóa cache của getAllRestaurants

    return registrationResult;
  }

  @Get('/drivers')
  findAllDrivers() {
    return this.driverService.findAll();
  }

  @Post('/drivers')
  async createDriver() {
    let emailData;
    let existingUser;

    do {
      emailData = generateRandomEmail();
      existingUser = await this.authService.findUserByEmail(emailData.email);
    } while (existingUser);

    // Create an address book entry first
    const addressBook = await this.addressBookService.create({
      street: '123 Driver St',
      city: 'Driver City',
      nationality: 'Driver Country',
      postal_code: 70000,
      location: { lat: 1.234567, lng: 7.891011 },
      is_default: true,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      title: 'Main'
    });

    const createDriverDto: createDriverSignup = {
      first_name: emailData.fullName.first_name,
      last_name: emailData.fullName.last_name,
      email: emailData.email,
      contact_email: [
        {
          title: 'Main',
          email: emailData.email,
          is_default: true
        }
      ],
      contact_phone: [
        {
          title: 'Main',
          number: '1234567890',
          is_default: true
        }
      ],
      available_for_work: true,
      active_points: 80,
      is_on_delivery: false,
      rating: {
        average_rating: 4.5,
        review_count: 100
      },
      password: '000000',
      phone: '1234567890',
      user_id: addressBook.data.id,
      vehicle: {
        license_plate: 'ABC123',
        model: 'motorcycle',
        color: 'red'
      },
      current_location: {
        lat: 123.456,
        lng: 78.91
      }
    };

    const registrationResult = await this.authService.register(
      createDriverDto,
      Enum_UserType.DRIVER
    );

    // await this.redisService.del('drivers:all'); // Xóa cache của getAllRestaurants

    return registrationResult;
  }

  @Get('/customer-care')
  findAllCustomerCare() {
    return this.customerCareService.findAll();
  }

  @Post('/customer-care')
  async createCustomerCare() {
    let emailData;
    let existingUser;

    do {
      emailData = generateRandomEmail();
      existingUser = await this.authService.findUserByEmail(emailData.email);
    } while (existingUser);

    // Create an address book entry first
    const addressBook = await this.addressBookService.create({
      street: '123 Driver St',
      city: 'Driver City',
      nationality: 'Driver Country',
      postal_code: 70000,
      location: { lat: 1.234567, lng: 7.891011 },
      is_default: true,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      title: 'Main'
    });

    const createCustomerCareDto: createCustomerCareSignup = {
      first_name: emailData.fullName.first_name,
      last_name: emailData.fullName.last_name,
      email: emailData.email,
      password: '000000',
      phone: '1234567890',
      user_id: addressBook.data.id as unknown as User,
      available_for_work: true,
      is_assigned: false,
      assigned_tickets: [],
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };

    const registrationResult = await this.authService.register(
      createCustomerCareDto,
      Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE
    );

    return registrationResult;
  }

  @Post('/order')
  async generateOrder() {
    // Create an address book entry first
    const order = await this.orderService.createOrder({
      customer_id: CUSTOMER_MOCK.customer_id,
      restaurant_id: RESTAURANT_MOCK.restaurant_id,
      status: 'PENDING',
      total_amount: 45.97,
      delivery_fee: 5.0,
      service_fee: 2.99,
      payment_status: 'PENDING',
      payment_method: 'FWallet',
      customer_location: ADDRESS_1_MOCK.id,
      restaurant_location: ADDRESS_2_MOCK.id,
      order_items: [
        {
          item_id: MENU_ITEM_MOCK.id,
          variant_id: MENU_ITEM_VARIANT_MOCK.id,
          name: 'Com Tao',
          quantity: 2,
          price_at_time_of_order: 12
        }
      ],
      customer_note: 'Lots of cry cheese please',
      restaurant_note: 'Bunch of sadness tear for this man',
      order_time: 1746628586,
      delivery_time: 1746628586,
      tracking_info: 'ORDER_PLACED'
    });

    return order;
  }

  @Post('/customer-care-inquiries')
  async generateCCI() {
    // Create an address book entry first
    const cci = await this.customerCareInquiriesService.create({
      customer_id: 'FF_CUS_430b0b56-df21-4ac4-ac98-904dd522f0ee',
      subject: 'I want cat',
      description: 'dude she just not into you.',
      status: 'OPEN'
    });

    return cci;
  }

  @Get('/:id')
  findOneCompanionAdmin(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch('/:id')
  updateCompanionAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto
  ) {
    // Ensure the role stays as COMPANION_ADMIN
    updateAdminDto.role = AdminRole.COMPANION_ADMIN;
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete('/:id')
  removeCompanionAdmin(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  @Get('restaurant/:id')
  findOneRestaurant(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Patch('restaurant/:id')
  updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto
  ) {
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Delete('restaurant/:id')
  removeRestaurant(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}
