import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminStaffManagementService } from './admin-staff-management.service';
import { CreateAdminStaffDto } from './dto/create-admin-staff.dto';
import { StaffManagementQueryDto } from './dto/staff-management-query.dto';
import { UpdateAdminStaffDto } from './dto/update-admin-staff.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1)
@Controller('admin-staff-management')
export class AdminStaffManagementController {
  constructor(
    private readonly adminStaffManagementService: AdminStaffManagementService,
  ) {}

  @Get()
  findAll(@Query() query: StaffManagementQueryDto) {
    return this.adminStaffManagementService.findAll(query);
  }

  @Post()
  create(@Req() req, @Body() body: CreateAdminStaffDto) {
    return this.adminStaffManagementService.create(body, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAdminStaffDto) {
    return this.adminStaffManagementService.update(+id, body);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.adminStaffManagementService.deactivate(+id);
  }
}
