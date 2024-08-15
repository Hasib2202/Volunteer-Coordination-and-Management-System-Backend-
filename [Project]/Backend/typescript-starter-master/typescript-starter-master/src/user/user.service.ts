// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  
  async getProfile(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id }, relations: ['volunteer','sponsor','eventManager'] });
  }
  
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['volunteer','sponsor','eventManager'] });
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByUserEmail(userEmail: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { userEmail } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  // for user finding details using jwt token
  async findByUsernameWithRelations(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['volunteer','sponsor','eventManager'],
    });
  }

  async getUserRoleById(id: number): Promise<{ role: UserRole }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { role: user.role };
  }

  // async create(CreateUserDto: CreateUserDto): Promise<User> {
  //   const user = this.usersRepository.create(CreateUserDto);
  //   return this.usersRepository.save(user);
  // }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.usersRepository.delete(id);
    if (!deleteResult.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{ message: string, user: User }> {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.usersRepository.save(user);
    return { message: 'User information updated successfully', user: updatedUser };
  }

  async findByNameSubstring(substring: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { name: Like(`%${substring}%`) },
    });
  }

  async updateUserStatus(id: number, isActive: UserStatus): Promise<User> {
    const res = await this.usersRepository.findOne({where: {id:id}});
    if (!res) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (!Object.values(UserStatus).includes(isActive)) {
      throw new Error(`Invalid status: ${isActive}`);
    }

    res.isActive = isActive;
    return await this.usersRepository.save(res);
  }

  // async findByEmail(userEmail: string): Promise<User | undefined> {
  //   return this.usersRepository.findOne({ where: { userEmail },
  //     select: ['id', 'resetPasswordToken', 'resetPasswordExpires'] });
  // }

  async findByEmail(userEmail: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { userEmail },
      select: ['id', 'userEmail', 'resetPasswordToken', 'resetPasswordExpires'],
    });
  }

  

  // async update(id: number, updateData: Partial<User>): Promise<User> {
  //   await this.usersRepository.update(id, updateData);
  //   return this.findOne(id);
  // }

  // async update(id: number, updateData: Partial<User>): Promise<void> {
  //   await this.usersRepository.update(id, updateData);
  // }
  
  async update(id: number, updateData: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, updateData);
  }

  // async findByResetPasswordToken(token: string): Promise<User> {
  //   return this.usersRepository.findOne({ where: { resetPasswordToken: token } });
  // }

  async findByResetPasswordToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { resetPasswordToken: token } });
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.usersRepository.update(id, { password: newPassword });
  }
}