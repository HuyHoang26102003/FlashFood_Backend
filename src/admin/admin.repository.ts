import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AdminRepository {
  private readonly logger = new Logger(AdminRepository.name);

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createAdminDto: Partial<Admin>): Promise<Admin> {
    try {
      const admin = this.adminRepository.create(createAdminDto);
      return await this.adminRepository.save(admin);
    } catch (error) {
      this.logger.error(
        `Error creating admin: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async findAll(): Promise<Admin[]> {
    try {
      return await this.adminRepository.find({
        relations: ['user', 'created_by'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(
        `Error finding all admins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Admin | null> {
    try {
      return await this.adminRepository.findOne({
        where: { id },
        relations: ['user', 'created_by']
      });
    } catch (error) {
      this.logger.error(
        `Error finding admin by id: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Admin | null> {
    try {
      return await this.adminRepository.findOne({
        where: { user_id: userId },
        relations: ['user', 'created_by']
      });
    } catch (error) {
      this.logger.error(
        `Error finding admin by user id: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto
  ): Promise<Admin | null> {
    try {
      // Create a new object without created_at
      const { created_at, ...updateData } = updateAdminDto;

      // Convert created_at to number if it exists
      const finalUpdateData = {
        ...updateData,
        updated_at: Math.floor(Date.now() / 1000),
        ...(created_at && {
          created_at:
            created_at instanceof Date
              ? Math.floor(created_at.getTime() / 1000)
              : created_at
        })
      };

      await this.adminRepository.update(id, finalUpdateData);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error updating admin: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    try {
      return await this.adminRepository.delete(id);
    } catch (error) {
      this.logger.error(
        `Error deleting admin: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async remove(id: string): Promise<Admin | null> {
    try {
      const admin = await this.findById(id);
      if (admin) {
        await this.adminRepository.delete(id);
      }
      return admin;
    } catch (error) {
      this.logger.error(
        `Error removing admin: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async findAllPaginated(
    skip: number,
    limit: number
  ): Promise<[Admin[], number]> {
    try {
      return await this.adminRepository.findAndCount({
        skip,
        take: limit,
        relations: ['user', 'created_by'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(
        `Error finding paginated admins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }
}
