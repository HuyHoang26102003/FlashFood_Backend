import { AddressBookRepository } from './address_book.repository';
import { CreateAddressBookDto } from './dto/create-address_book.dto';
import { UpdateAddressBookDto } from './dto/update-address_book.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { AddressBook } from './entities/address_book.entity';
import { CustomersRepository } from 'src/customers/customers.repository';
export declare class AddressBookService {
    private readonly addressBookRepository;
    private readonly customerRepository;
    constructor(addressBookRepository: AddressBookRepository, customerRepository: CustomersRepository);
    create(createAddressBookDto: CreateAddressBookDto, customerId?: string): Promise<ApiResponse<AddressBook>>;
    findAll(): Promise<ApiResponse<AddressBook[]>>;
    findOne(id: string): Promise<ApiResponse<AddressBook>>;
    update(id: string, updateAddressBookDto: UpdateAddressBookDto): Promise<ApiResponse<AddressBook>>;
    remove(id: string, customerId?: string): Promise<ApiResponse<null>>;
    toggleCustomerAddress(customerId: string, addressId: string): Promise<ApiResponse<any>>;
}
