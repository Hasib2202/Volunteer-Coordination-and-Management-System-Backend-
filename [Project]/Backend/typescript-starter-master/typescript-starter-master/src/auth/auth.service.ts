
//   async register(registerDto: RegisterDto) {
//     const { name, email, password, role, phoneNumber } = registerDto;

//     // Find users with the same email
//     const existingUsers = await this.usersService.findByEmail(email);

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Check if a user with the same email, name, and password already exists
//     const userExists = existingUsers.some(user =>
//       user.name === name && bcrypt.compareSync(password, user.password)
//     );

//     if (userExists) {
//       throw new ConflictException('User with the same email, name, and password already exists.');
//     }

//     // Check if a user with the same email exists
//     const emailTaken = existingUsers.length > 0;

//     if (emailTaken) {
//       throw new ConflictException('Email already exists.');
//     }

//     // Create a new user
//     const newUser = await this.usersService.createUser({
//       email,
//       name,
//       password: hashedPassword,
//       role,
//       phoneNumber,
//     });

    // If the role is 'Volunteer', create a corresponding Volunteer record
    // if (role.toLowerCase() === 'volunteer') {
    //   await this.volunteerService.createVolunteer({
    //     user: newUser,
    //     skills: '', // Add default or required values as needed
    //     availability: '' // Add default or required values as needed
    //   });
    // }

//     return newUser;
//   }
  

//   async login(loginDto: LoginDto) {
//     const { email, password } = loginDto;

//     // Find all users with the given email
//     const users = await this.usersService.findByEmail(email);

//     // If no users with the given email
//     if (users.length === 0) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // Check if there is exactly one user with the provided email and password
//     const matchingUsers = users.filter(user => bcrypt.compareSync(password, user.password));

//     // If there are no matching users or more than one matching user
//     if (matchingUsers.length === 0) {
//       throw new UnauthorizedException('Invalid credentials');
//     } else if (matchingUsers.length > 1) {
//       throw new UnauthorizedException('Multiple users with the same email and password found. Please contact support.');
//     }

//     // Exactly one matching user found
//     const user = matchingUsers[0];
//     const payload = { email: user.email, sub: user.id, role: user.role };
//     return { access_token: this.jwtService.sign(payload) };
//   }

//   async validateUser(userId: number): Promise<any> {
//     // Use where clause to find the user by ID
//     const user = await this.usersService.findOne({ where: { id: userId } });
//     if (user) {
//       // Return the user object or any required user details
//       return user;
//     }
//     return null;
//   }
  
// }

// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { VolunteerService } from '../volunteer/volunteer.service';
import { RegisterDto, LoginDto, ResetPasswordDto, ResetPasswordTokenDto, ChangePasswordDto } from './dto/auth.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { EventManagerService } from 'src/event-manager/event-manager.service';
import { SponsorService } from 'src/sponsor/sponsor.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private volunteerService: VolunteerService,
    private jwtService: JwtService,
    private eventManagerService: EventManagerService,
    private sponsorService: SponsorService,
    private mailerService: MailerService,
  ) {}
  
  async register(registerDto: RegisterDto): Promise<User> {
    const { username, password, name, userEmail, role, phoneNumber } = registerDto;

    const existingUser = await this.userService.findByUsername(username);
    const existingUserEmail = await this.userService.findByEmail(userEmail);
    if (existingUserEmail) {
      throw new ConflictException('User email already exists.');
    }
    else if (existingUser) {
      throw new ConflictException('Username already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.createUser({
      username,
      name,
      userEmail,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    switch (role) {
      case UserRole.VOLUNTEER:
        await this.volunteerService.create({ user: newUser });
        break;
      case UserRole.EVENT_MANAGER:
        await this.eventManagerService.create({ user: newUser });
        break;
      case UserRole.SPONSOR:
        await this.sponsorService.create({ user: newUser });
        break;
    }

    return newUser;
  }
  
  async login(loginDto: LoginDto, req: any) {
    const { username, password } = loginDto;
    const user = await this.userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials for login request');
    }
    req.session.email = user.userEmail; // Set session email
    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    }; // Set session user data

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(session: any) {
    session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
    return { message: 'Logged out successfully' };
  }


  // useing session 1
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userService.update(userId, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  // using jwt 2
  // async resetPassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  //   const user = await this.userService.findById(userId);
  //   if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
  //     throw new UnauthorizedException('Current password is incorrect');
  //   }

  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   await this.userService.updatePassword(userId, hashedPassword);
  // }

  //----------------------------------------------------------------


  // async forgotPassword(userEmail: string) {
  //   const user = await this.userService.findByEmail(userEmail);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  
  //   const resetToken = this.generateResetToken();
  //   await this.userService.update(user.id, { 
  //     resetPasswordToken: resetToken,
  //     resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour from now
  //   });
  
  //   // TODO: Implement email sending logic
  //   // await this.mailerService.sendResetCodeEmail(user.username, resetToken);
  
  //   // console.log('Reset token for testing:', resetToken); // Remove in production!
  
  //   return { 
  //     message: 'Password reset instructions sent to your email',
  //     resetToken: resetToken // Remove in production!
  //   };
  // }

  // async resetPasswordWithToken(resetTokenDto: ResetPasswordTokenDto) {
  //   const user = await this.userService.findByResetPasswordToken(resetTokenDto.token);
  //   if (!user || user.resetPasswordExpires < new Date()) {
  //     throw new BadRequestException('Invalid or expired password reset token');
  //   }

  //   const hashedPassword = await bcrypt.hash(resetTokenDto.newPassword, 10);
  //   await this.userService.update(user.id, {
  //     password: hashedPassword,
  //     resetPasswordToken: null,
  //     resetPasswordExpires: null
  //   });

  //   return { message: 'Password reset successfully' };
  // }

  // private generateResetToken(): string {
  //   return Math.random().toString(36).substr(2, 10);
  // }

  async forgotPassword(userEmail: string) {
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetCode = this.generateResetCode();
    const resetCodeExpires = new Date(Date.now() + 3600000); // 1 hour from now

    try {
      await this.userService.update(user.id, {
        resetPasswordToken: resetCode,
        resetPasswordExpires: resetCodeExpires,
      });

      await this.mailerService.sendResetCodeEmail(user.userEmail, resetCode);

      return {
        message: 'Password reset code sent to your email',
      };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  private generateResetCode(): string {
    return Math.random().toString(36).slice(-8).toUpperCase();
  }

  async resetPasswordWithCode(resetCodeDto: ResetPasswordDto) {
    const user = await this.userService.findByResetPasswordToken(resetCodeDto.code);

    if (!user || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    try {
      const hashedPassword = await bcrypt.hash(resetCodeDto.newPassword, 10);
      await this.userService.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Error in resetPasswordWithCode:', error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
  
  

}