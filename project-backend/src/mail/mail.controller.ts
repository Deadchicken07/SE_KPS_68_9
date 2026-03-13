import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { email: string }) {
    return this.mailService.sendOtp(body.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { email: string; code: string }) {
    return this.mailService.verifyOtp(body.email, body.code);
  }
}
