import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentTabQueryDto } from './dto/appointment-tab-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentsService } from './appointments.service';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('my')
  listMyAppointments(@Req() req: any, @Query() query: AppointmentTabQueryDto) {
    return this.appointmentsService.listMyAppointments(
      this.getUserIdFromRequest(req),
      query,
    );
  }

  @Patch(':id/reschedule')
  rescheduleMyAppointment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.rescheduleMyAppointment(
      this.getUserIdFromRequest(req),
      this.parseAppointmentId(id),
      body,
    );
  }

  @Delete(':id')
  cancelMyAppointment(@Req() req: any, @Param('id') id: string) {
    return this.appointmentsService.cancelMyAppointment(
      this.getUserIdFromRequest(req),
      this.parseAppointmentId(id),
    );
  }

  private getUserIdFromRequest(req: any) {
    const userId = Number(req?.user?.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return userId;
  }

  private parseAppointmentId(id: string) {
    const appointmentId = Number(id);
    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      throw new BadRequestException('Invalid appointment id');
    }
    return appointmentId;
  }
}
