// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, UsePipes, ValidationPipe, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordTokenDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { RolesGuard } from './guards/roles.guard';
import { SessionGuard } from './guards/session.guard';

@Controller('auth')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  // @Post('login')
  // @UsePipes(new ValidationPipe())
  // async login(@Body() loginDto: LoginDto,  @Session() session: any) {
  //   const result = await this.authService.login(loginDto);
  //   session.user = result.user;
  //   return result;
  // }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    return this.authService.login(loginDto, req);
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(SessionGuard)
  @Post('logout')
  async logout(@Session() session: any) {
    return this.authService.logout(session);
  }

  // using session 1
  @UseGuards(SessionGuard)
  @Post('change-password')
  @UsePipes(new ValidationPipe())
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.session.user.id, changePasswordDto);
  }

  // using jwt 2
  // @UseGuards(JwtAuthGuard)
  // @Post('reset-password')
  // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: any) {
  //   const userId = parseInt(req.user.userId, 10); // Ensure userId is a number
  //   await this.authService.resetPassword(userId, resetPasswordDto.currentPassword, resetPasswordDto.newPassword);
  //   return { message: 'Password reset successful' };
  // }


  //----------------------------------------------------------------
  // @UseGuards(JwtAuthGuard)
  // @UseGuards(SessionGuard)
  // @Post('forgot-password')
  // async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(forgotPasswordDto.userEmail);
  // }

  // @Post('reset-password-token')
  // async resetPasswordWithToken(@Body() resetTokenDto: ResetPasswordTokenDto) {
  //   return this.authService.resetPasswordWithToken(resetTokenDto);
  // }

  // @UseGuards(SessionGuard)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.userEmail);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordWithCode(resetPasswordDto);
  }



  // @UseGuards(JwtAuthGuard)
  @UseGuards(SessionGuard)
  @Get('profile')
  getProfile(@Session() session: any) {
    return session.user;
  }
}
