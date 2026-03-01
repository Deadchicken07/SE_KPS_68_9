import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }
  
}

// // ตัวอย่างเอาไปใช้กับ controller อื่น
// //@UseGuards(JwtAuthGuard, RolesGuard)  เช็คว่ามีการดเเก JWT มั้ย และเช็คว่า role ตรงกับที่กำหนดมั้ย
// @Roles(1,2) // // กำหนดว่า endpoint นี้ต้องการ role_id = 2 เท่านั้นถึงจะเข้าถึงได้
// @Get('appointments')
