import { AddressBookService } from './address_book.service';
import { CreateAddressBookDto } from './dto/create-address_book.dto';
import { UpdateAddressBookDto } from './dto/update-address_book.dto';
export declare class AddressBookController {
    private readonly addressBookService;
    constructor(addressBookService: AddressBookService);
    createAddressBook(createAddressBookDto: CreateAddressBookDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/address_book.entity").AddressBook>>;
    getAllAddressBooks(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/address_book.entity").AddressBook[]>>;
    getAddressBookById(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/address_book.entity").AddressBook>>;
    updateAddressBook(addressBookId: string, updateAddressBookDto: UpdateAddressBookDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/address_book.entity").AddressBook>>;
    deleteAddressBook(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
