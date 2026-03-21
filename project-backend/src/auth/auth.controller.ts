import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateDoctorDto, RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RolesGuard } from './roles.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password);

    res.cookie('_pgsmcmsss', result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return { message: 'login success' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.authService.getMe(req.user.sub);
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('_pgsmcmsss');
    return { message: 'logout success' };
  }
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body, req.user.sub);
  }
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPasswordByOtp(body.email, body.newPassword);
  }
  @Post('admin/create-doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  createDoctor(@Body() dto: CreateDoctorDto, @Req() req) {
    return this.authService.createDoctor(dto, req.user.sub);
  }
}

// // ตัวอย่างเอาไปใช้กับ controller อื่น
// //@UseGuards(JwtAuthGuard, RolesGuard)  เช็คว่ามีการดเเก JWT มั้ย และเช็คว่า role ตรงกับที่กำหนดมั้ย
// @Roles(1,2) // // กำหนดว่า endpoint นี้ต้องการ role_id = 2 เท่านั้นถึงจะเข้าถึงได้
// @Get('appointments')
