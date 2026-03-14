import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

  @Get('delivery-history')
  findDeliveryHistory(@Query() query: DeliveryHistoryQueryDto) {
    return this.pharmacistService.findDeliveryHistory(query);
  }

  @Get('patient-history')
  findPatientHistory(@Query() query: PatientHistoryQueryDto) {
    return this.pharmacistService.findPatientHistory(query);
  }
}
