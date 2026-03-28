import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { DeliveryHistoryQueryDto } from './dto/delivery-history-query.dto';
import { PatientHistoryQueryDto } from './dto/patient-history-query.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { PharmacistService } from './pharmacist.service';

@Controller('pharmacist')
export class PharmacistController {
  constructor(private readonly pharmacistService: PharmacistService) {}

  @Get('medications')
  findMedications(@Query('search') search?: string) {
    return this.pharmacistService.findMedications(search);
  }

  @Post('medications')
  createMedication(@Body() dto: CreateMedicationDto) {
    return this.pharmacistService.createMedication(dto);
  }

  @Patch('medications/:id')
  updateMedication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicationDto,
  ) {
    return this.pharmacistService.updateMedication(id, dto);
  }

  @Delete('medications/:id')
  removeMedication(@Param('id', ParseIntPipe) id: number) {
    return this.pharmacistService.removeMedication(id);
  }

  @Get('order-form')
  getOrderForm() {
    return this.pharmacistService.getOrderForm();
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.pharmacistService.createOrder(dto, auth.userId);
  }

  @Get('delivery-history')
  findDeliveryHistory(@Query() query: DeliveryHistoryQueryDto) {
    return this.pharmacistService.findDeliveryHistory(query);
  }

  @Get('patient-history')
  findPatientHistory(@Query() query: PatientHistoryQueryDto) {
    return this.pharmacistService.findPatientHistory(query);
  }

  private getAuthContext(req): { userId: number; roleId: number } {
    const userId = Number(req?.user?.sub);
    const roleId = Number(req?.user?.role_id);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!Number.isInteger(roleId) || roleId <= 0) {
      throw new UnauthorizedException('Invalid role payload');
    }

    return { userId, roleId };
  }

  private ensurePharmacistAccess(roleId: number) {
    const allowedRoleIds = new Set([1, 5]);

    if (!allowedRoleIds.has(roleId)) {
      throw new ForbiddenException('Pharmacist access only');
    }
  }
}
