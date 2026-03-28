import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffHomeModule } from '../staff-home/staff-home.module';
import { PhamaHomeController } from './phama-home.controller';
import { PhamaHomeService } from './phama-home.service';

@Module({
  imports: [PrismaModule, StaffHomeModule],
  controllers: [PhamaHomeController],
  providers: [PhamaHomeService],
})
export class PhamaHomeModule {}
