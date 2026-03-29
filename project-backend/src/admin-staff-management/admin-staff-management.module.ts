import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminStaffManagementController } from './admin-staff-management.controller';
import { AdminStaffManagementService } from './admin-staff-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminStaffManagementController],
  providers: [AdminStaffManagementService],
})
export class AdminStaffManagementModule {}
