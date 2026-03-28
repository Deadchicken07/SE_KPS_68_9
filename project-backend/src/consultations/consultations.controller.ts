import { Controller, Get, Post, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  findAll(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.consultationsService.findAll(userId, page, limit);
  }

  @Post()
  create(@Body() body : CreateConsultationDto){
    return this.consultationsService.create(body)
  }
}
