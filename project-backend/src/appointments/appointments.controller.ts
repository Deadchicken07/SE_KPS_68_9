import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('me')
  getMyAppointments(@Req() req) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.getMySchedule(userId);
  }

  @Get(':id')
  getAppointment(@Req() req, @Param('id', ParseIntPipe) appointmentId: number) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.getAppointmentDetails(
      userId,
      appointmentId,
    );
  }

  @Patch(':id/reschedule')
  rescheduleAppointment(
    @Req() req,
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.rescheduleAppointment(
      userId,
      appointmentId,
      dto,
    );
  }

  @Patch(':id/pay')
  payAppointment(
    @Req() req,
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() body: { slipUrl: string },
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.markAppointmentPaid(
      userId,
      appointmentId,
      body.slipUrl,
    );
  }

  @Get()
  findAllByStaff(staffId : number){
    return this.appointmentsService.findAllByStaff(staffId)
  }

  private getUserIdFromRequest(req): number {
    const userId = Number(req?.user?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return userId;
  }
}
