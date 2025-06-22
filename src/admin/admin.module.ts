import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './admin.repository';
import { AdminGateway } from './admin.gateway';
import { UsersModule } from '../users/users.module';
import { BannedAccount } from 'src/banned-account/entities/banned-account.entity';
import { AuthService } from 'src/auth/auth.service';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { CustomersRepository } from 'src/customers/customers.repository';
import { DriversRepository } from 'src/drivers/drivers.repository';
import { CustomerCaresRepository } from 'src/customer_cares/customer_cares.repository';
import { Customer } from 'src/customers/entities/customer.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { CartItemsService } from 'src/cart_items/cart_items.service';
import { CartItemsRepository } from 'src/cart_items/cart_items.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { EmailService } from 'src/mailer/email.service';
import * as nodemailer from 'nodemailer';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { Order } from 'src/orders/entities/order.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';
import { AdminFakeController } from './admin.controller-fake';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      BannedAccount,
      FWallet,
      Customer,
      CartItem,
      MenuItem,
      MenuItemVariant,
      Driver,
      Transaction,
      FoodCategory,
      AddressBook,
      Restaurant,
      Order,
      User,
      CustomerCare
    ]),
    UsersModule
  ],
  controllers: [AdminController, AdminControllerFake],
  providers: [
    {
      provide: 'MAIL_TRANSPORT',
      useFactory: () => {
        return nodemailer.createTransport({
          host: 'smtp.mailtrap.io',
          port: 2525,
          auth: {
            user: '389c1523b80572', // Your Mailtrap username
            pass: '9685cd52ea218d' // Your Mailtrap password
          }
        });
      }
    },
    AdminService,
    AdminRepository,
    AdminGateway,
    JwtService,
    EmailService,
    CartItemsService,
    CartItemsRepository,
    MenuItemsRepository,
    AddressBookRepository,
    MenuItemVariantsRepository,
    UserRepository,
    AuthService,
    FWalletsRepository,
    RestaurantsRepository,
    CustomersRepository,
    DriversRepository,
    CustomerCaresRepository
  ],
  exports: [AdminService, AdminRepository, AdminGateway]
})
export class AdminModule {}
