import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffHomeController } from './staff-home.controller';
import { StaffHomeService } from './staff-home.service';

@Module({
  imports: [PrismaModule],
  controllers: [StaffHomeController],
  providers: [StaffHomeService],
  exports: [StaffHomeService],
})
export class StaffHomeModule {}
