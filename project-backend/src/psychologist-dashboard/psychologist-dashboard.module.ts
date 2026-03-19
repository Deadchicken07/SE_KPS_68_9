import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PsychologistDashboardController } from './psychologist-dashboard.controller';
import { PsychologistDashboardService } from './psychologist-dashboard.service';

@Module({
  imports: [PrismaModule],
  controllers: [PsychologistDashboardController],
  providers: [PsychologistDashboardService],
})
export class PsychologistDashboardModule {}
