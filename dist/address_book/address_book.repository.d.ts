import { Repository } from 'typeorm';
import { AddressBook } from './entities/address_book.entity';
import { CreateAddressBookDto } from './dto/create-address_book.dto';
import { UpdateAddressBookDto } from './dto/update-address_book.dto';
export declare class AddressBookRepository {
    private repository;
    constructor(repository: Repository<AddressBook>);
    create(createDto: CreateAddressBookDto): Promise<AddressBook>;
    findAll(): Promise<AddressBook[]>;
    findById(id: string): Promise<AddressBook | null>;
    findByStreetAndCity(street: string, city: string): Promise<AddressBook | null>;
    update(id: string, updateDto: UpdateAddressBookDto): Promise<AddressBook | null>;
    delete(id: string): Promise<boolean>;
}
