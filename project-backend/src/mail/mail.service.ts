import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OtpRecord } from './dto/OtpRecord.dto';

@Injectable()
export class MailService {
  private otpStore = new Map<string, OtpRecord>();
  private verifiedStore = new Map<string, number>();
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    if (!this.emailPattern.test(email)) {
      throw new BadRequestException('Invalid email address');
    }

    const otp = this.generateOtp();

    console.log('SEND OTP EMAIL:', email);
    console.log('OTP:', otp);

    try {
      await this.transporter.sendMail({
        from: `"OTP Service" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'OTP Verification',
        html: `<h2>Your OTP: ${otp}</h2><p>Expires in 2 minutes</p>`,
      });
    } catch (error) {
      console.error('SEND OTP ERROR:', error);
      throw new BadRequestException('เมลนี้ไม่มีอยู่จริง');
    }

    const expires = Date.now() + 120000;

    this.otpStore.set(email, {
      code: otp,
      expires,
    });

    console.log('OTP STORE:', this.otpStore);

    return {
      message: 'OTP sent',
      expiresIn: 120,
    };
  }

  verifyOtp(email: string, code: string) {
    email = email.trim().toLowerCase();
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
    this.verifiedStore.set(email, Date.now() + 10 * 60 * 1000);

    return { message: 'OTP verified' };
  }

  consumeVerifiedEmail(email: string) {
    email = email.trim().toLowerCase();
    const expires = this.verifiedStore.get(email);

    if (!expires) {
      throw new BadRequestException('Email not verified by OTP');
    }

    if (Date.now() > expires) {
      this.verifiedStore.delete(email);
      throw new BadRequestException('OTP verification expired');
    }

    this.verifiedStore.delete(email);
  }
}
