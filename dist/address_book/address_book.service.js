"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressBookService = void 0;
const common_1 = require("@nestjs/common");
const address_book_repository_1 = require("./address_book.repository");
const createResponse_1 = require("../utils/createResponse");
const customers_repository_1 = require("../customers/customers.repository");
let AddressBookService = class AddressBookService {
    constructor(addressBookRepository, customerRepository) {
        this.addressBookRepository = addressBookRepository;
        this.customerRepository = customerRepository;
    }
    async create(createAddressBookDto, customerId) {
        try {
            console.log('check create address book service', createAddressBookDto);
            const newAddress = await this.addressBookRepository.create(createAddressBookDto);
            console.log('check create address book service newAddress', newAddress);
            if (customerId) {
                const customer = await this.customerRepository.findById(customerId);
                if (!customer) {
                    return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
                }
                if (!customer.address) {
                    customer.address = [];
                }
                customer.address.push(newAddress);
                await this.customerRepository.save(customer);
            }
            return (0, createResponse_1.createResponse)('OK', newAddress, 'Address created successfully');
        }
        catch (error) {
            console.error('Error creating address:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while creating the address');
        }
    }
    async findAll() {
        try {
            const addresses = await this.addressBookRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', addresses, 'Addresses fetched successfully');
        }
        catch (error) {
            console.error('Error fetching addresses:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching addresses');
        }
    }
    async findOne(id) {
        try {
            const address = await this.addressBookRepository.findById(id);
            if (!address) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Address not found');
            }
            return (0, createResponse_1.createResponse)('OK', address, 'Address fetched successfully');
        }
        catch (error) {
            console.error('Error fetching address:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching the address');
        }
    }
    async update(id, updateAddressBookDto) {
        try {
            const updatedAddress = await this.addressBookRepository.update(id, updateAddressBookDto);
            if (!updatedAddress) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Address not found');
            }
            return (0, createResponse_1.createResponse)('OK', updatedAddress, 'Address updated successfully');
        }
        catch (error) {
            console.error('Error updating address:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while updating the address');
        }
    }
    async remove(id, customerId) {
        try {
            if (customerId) {
                const customer = await this.customerRepository.findById(customerId);
                if (!customer) {
                    return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
                }
                customer.address = customer.address.filter(addr => addr.id !== id);
                await this.customerRepository.save(customer);
            }
            await this.addressBookRepository.delete(id);
            return (0, createResponse_1.createResponse)('OK', null, 'Address deleted successfully');
        }
        catch (error) {
            console.error('Error deleting address:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while deleting the address');
        }
    }
    async toggleCustomerAddress(customerId, addressId) {
        try {
            const customer = await this.customerRepository.findById(customerId);
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            const address = await this.addressBookRepository.findById(addressId);
            if (!address) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Address not found');
            }
            if (!customer.address) {
                customer.address = [];
            }
            const existingIndex = customer.address.findIndex(addr => addr.id === addressId);
            console.log('cehck what here', existingIndex, addressId, customer.address);
            if (existingIndex === -1) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Address not associated with customer');
            }
            customer.address.forEach(addr => {
                if (addr.id !== addressId) {
                    addr.is_default = false;
                }
            });
            customer.address[existingIndex].is_default =
                !customer.address[existingIndex].is_default;
            await this.customerRepository.save(customer);
            return (0, createResponse_1.createResponse)('OK', customer, 'Customer default address updated successfully');
        }
        catch (error) {
            console.error('Error toggling customer address:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while updating customer address');
        }
    }
};
exports.AddressBookService = AddressBookService;
exports.AddressBookService = AddressBookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [address_book_repository_1.AddressBookRepository,
        customers_repository_1.CustomersRepository])
], AddressBookService);
//# sourceMappingURL=address_book.service.js.map