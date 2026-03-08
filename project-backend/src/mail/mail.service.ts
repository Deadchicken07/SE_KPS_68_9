import { Injectable } from '@nestjs/common';
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
    const otp = this.generateOtp();

    this.otpStore.delete(email);

    const expires = Date.now() + 60_000;

    this.otpStore.set(email, {
      code: otp,
      expires,
    });

    console.log('OTP:', otp);

    try {
      const info = await this.transporter.sendMail({
        from: `"OTP Service" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP code is ${otp}`,
        html: `<h2>Your OTP: ${otp}</h2><p>Expires in 60 seconds</p>`,
      });

      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Mail error:', error);
    }

    return {
      message: 'OTP sent',
      expiresIn: 60,
    };
  }

  verifyOtp(email: string, code: string) {
    const record = this.otpStore.get(email);

    if (!record) {
      return { message: 'OTP not found' };
    }

    if (Date.now() > record.expires) {
      this.otpStore.delete(email);
      return { message: 'OTP expired' };
    }

    if (record.code !== code) {
      return { message: 'OTP invalid' };
    }

    this.otpStore.delete(email);

    return { message: 'OTP verified' };
  }
}
