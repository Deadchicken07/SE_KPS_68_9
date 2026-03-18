import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PharmacistController } from './pharmacist.controller';
import { PharmacistService } from './pharmacist.service';

@Module({
  imports: [PrismaModule],
  controllers: [PharmacistController],
  providers: [PharmacistService],
})
export class PharmacistModule {}
