import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OtpRecord } from './dto/OtpRecord.dto';

@Injectable()
export class MailService {
  private otpStore = new Map<string, OtpRecord>();

  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string) {
    email = email.trim().toLowerCase();

    const otp = this.generateOtp();

    const expires = Date.now() + 120000; // 2 นาที

    this.otpStore.set(email, {
      code: otp,
      expires,
    });

    console.log('SEND OTP EMAIL:', email);
    console.log('OTP:', otp);
    console.log('OTP STORE:', this.otpStore);

    await this.transporter.sendMail({
      from: `"OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP Verification',
      html: `<h2>Your OTP: ${otp}</h2><p>Expires in 2 minutes</p>`,
    });

    return {
      message: 'OTP sent',
      expiresIn: 120,
    };
  }

  verifyOtp(email: string, code: string) {
    const record = this.otpStore.get(email);

    if (!record) {
      throw new BadRequestException('OTP not found');
    }

    if (Date.now() > record.expires) {
      this.otpStore.delete(email);
      throw new BadRequestException('OTP expired');
    }

    if (record.code !== code) {
      throw new BadRequestException('OTP invalid');
    }

    this.otpStore.delete(email);

    return { message: 'OTP verified' };
  }
}
