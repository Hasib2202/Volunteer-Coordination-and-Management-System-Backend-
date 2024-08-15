// src/user/user.controller.ts
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseEnumPipe, ParseIntPipe, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserStatus } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/strategies/roles.decorator';
import { UpdateUserDto } from './dto/create-user.dto';

@Controller('user')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:id')
  @Roles(UserRole.ADMIN,UserRole.EVENT_MANAGER, UserRole.VOLUNTEER,UserRole.SPONSOR)
  async getProfile(@Param('id') id: number): Promise<User> {
    return this.userService.getProfile(id);
  }

  @Get('allUsers')
  @Roles(UserRole.ADMIN,UserRole.EVENT_MANAGER, UserRole.VOLUNTEER,UserRole.SPONSOR)
  async getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('byid/:id')
  @Roles(UserRole.ADMIN,UserRole.EVENT_MANAGER, UserRole.VOLUNTEER,UserRole.SPONSOR)
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Get('byusername/:username')
  @Roles(UserRole.ADMIN,UserRole.EVENT_MANAGER, UserRole.VOLUNTEER,UserRole.SPONSOR)
  async findByUsername(@Param('username') username : string): Promise<User> {
    return this.userService.findByUsername(username);
  }
  
  @Get('role/:id')
  async getUserRoleById(@Param('id', ParseIntPipe) id: number): Promise<{ role: UserRole }> {
    return this.userService.getUserRoleById(id);
  }

  // delete from user table
  @Delete('delete/:id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  async remove(@Param('id') id: number) {
    try {
      await this.userService.remove(id);
      return { message: `User with ID ${id} deleted from the user table` };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      const { message, user } = await this.userService.updateUser(id, updateUserDto);
      return { message, user };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('search/name')
  @Roles(UserRole.ADMIN,UserRole.EVENT_MANAGER, UserRole.VOLUNTEER)
  async findByNameSubstring(@Query('substring') substring: string) {
    return this.userService.findByNameSubstring(substring);
  }

  @Patch('status/:id')
  @Roles(UserRole.ADMIN,UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  async updateUserStatus(
    @Param('id') id: number,
    @Body('isActive') isActive: UserStatus
  ) {
    try {
      const res = await this.userService.updateUserStatus(id, isActive);
      return { res };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}