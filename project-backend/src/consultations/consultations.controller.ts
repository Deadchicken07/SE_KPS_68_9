import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  findAll( @Param('id', ParseIntPipe) id: number) {
    return this.consultationsService.findAll(id);
  }

  @Post()
  create(@Body() body : CreateConsultationDto){
    return this.consultationsService.create(body)
  }
}
