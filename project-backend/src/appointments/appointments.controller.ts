import {
  BadRequestException,
  Body,
  Controller,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AppointmentsService } from './appointments.service';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('available-slots')
  async getAvailableSlots(@Req() req, @Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('date query parameter is required');
    }
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.getAvailableSlots(date, userId);
  }

  @Get('payments')
  @UseGuards(RolesGuard)
  @Roles(1) // Admin only
  getAllPaidAppointments() {
    return this.appointmentsService.getAllPaidAppointments();
  }

  @Get('medicine-payments')
  @UseGuards(RolesGuard)
  @Roles(1) // Admin only
  getAllMedicinePayments() {
    return this.appointmentsService.getAllMedicinePayments();
  }

  @Get('receipts/:id/payment-details')
  async getMedicinePaymentDetails(
    @Req() req,
    @Param('id', ParseIntPipe) receiptId: number,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.getMedicinePaymentDetails(
      userId,
      receiptId,
    );
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(1) // Admin only
  async confirmPayment(@Param('id', ParseIntPipe) appointmentId: number) {
    return this.appointmentsService.confirmPayment(appointmentId);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(1) // Admin only
  async rejectPayment(@Param('id', ParseIntPipe) appointmentId: number) {
    return this.appointmentsService.rejectPayment(appointmentId);
  }

  @Patch('receipts/:id/confirm')
  @UseGuards(RolesGuard)
  @Roles(1)
  async confirmMedicinePayment(
    @Param('id', ParseIntPipe) receiptId: number,
    @Body('slipUrl') slipUrl: string,
  ) {
    return this.appointmentsService.confirmMedicinePayment(receiptId, slipUrl);
  }

  @Patch('receipts/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(1)
  async rejectMedicinePayment(@Param('id', ParseIntPipe) receiptId: number) {
    return this.appointmentsService.rejectMedicinePayment(receiptId);
  }

  @Patch('receipts/:id/pay')
  async payMedicineByReceipt(
    @Req() req,
    @Param('id', ParseIntPipe) receiptId: number,
    @Body() body: { slipUrl: string },
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.payMedicineByReceipt(
      userId,
      receiptId,
      body.slipUrl,
    );
  }

  @Get('staff/me')
  getMyStaffAppointments(@Req() req) {
    const userId = this.getUserIdFromRequest(req);
    const roleId = this.getRoleIdFromRequest(req);

    if (![3, 4].includes(roleId)) {
      throw new ForbiddenException(
        'Only clinical staff can access staff appointments',
      );
    }

    return this.appointmentsService.findAllByStaff(userId);
  }

  @Get('me')
  getMyAppointments(@Req() req) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.getMySchedule(userId);
  }

  @Post()
  createAppointment(@Req() req, @Body() body: any) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.createAppointment(userId, body);
  }

  @Post('admin')
  @UseGuards(RolesGuard)
  @Roles(1) // Admin only
  async createAppointmentByAdmin(@Body() body: any) {
    let userId = body.userId;
    if (!userId) {
      const user = await this.appointmentsService.createWalkinUser({
        name: body.name,
        sur_name: body.surname,
        phone: body.phone,
        nation_id: body.nationId,
        medical_condition: body.medicalCondition,
        allergy_drug: body.allergyDrug,
        current_address: body.currentAddress,
        nation_address: body.nationAddress,
      });
      userId = user.user_id;
    }
    return this.appointmentsService.createAppointment(userId, body);
  }

  @Get(':id')
  getAppointment(@Req() req, @Param('id', ParseIntPipe) appointmentId: number) {
    const userId = this.getUserIdFromRequest(req);
    const roleId = this.getRoleIdFromRequest(req);
    return this.appointmentsService.getAppointmentDetails(
      userId,
      appointmentId,
      roleId === 1,
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

  @Patch(':id/meet-url/delete')
  deleteMeetUrl(@Req() req, @Param('id', ParseIntPipe) appointmentId: number) {
    const staffId = this.getUserIdFromRequest(req);
    return this.appointmentsService.deleteMeetUrl(staffId, appointmentId);
  }

  @Patch(':id/meet-url')
  updateMeetUrl(
    @Req() req,
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() body: { meetUrl: string },
  ) {
    const staffId = this.getUserIdFromRequest(req);
    return this.appointmentsService.updateMeetUrl(
      staffId,
      appointmentId,
      body.meetUrl,
    );
  }

  @Patch(':id/pay')
  payAppointment(
    @Req() req,
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() body: { slipUrl: string },
  ) {
    const userId = this.getUserIdFromRequest(req);
    const roleId = this.getRoleIdFromRequest(req);
    const isAdmin = roleId === 1;
    return this.appointmentsService.markAppointmentPaid(
      userId,
      appointmentId,
      body.slipUrl,
      isAdmin,
    );
  }

  @Patch(':id/pay-medicine')
  payMedicine(
    @Req() req,
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() body: { slipUrl: string },
  ) {
    const userId = this.getUserIdFromRequest(req);
    const roleId = this.getRoleIdFromRequest(req);
    const isAdmin = roleId === 1;
    return this.appointmentsService.payMedicine(
      userId,
      appointmentId,
      body.slipUrl,
      isAdmin,
    );
  }

  @Get(':id/consultation')
  getConsultationForAppointment(
    @Req() req,
    @Param('id', ParseIntPipe) appointmentId: number,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.appointmentsService.getConsultationForAppointment(
      userId,
      appointmentId,
    );
  }

  @Get('patient/:userId')
  findByPatient(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('staffId') staffId?: string,
  ) {
    return this.appointmentsService.findByPatient(
      userId,
      staffId ? Number(staffId) : undefined,
    );
  }

  @Get('staff/:staffId')
  findAllByStaff(@Req() req, @Param('staffId', ParseIntPipe) staffId: number) {
    const roleId = this.getRoleIdFromRequest(req);
    const userId = this.getUserIdFromRequest(req);

    if (roleId !== 1 && userId !== staffId) {
      throw new ForbiddenException(
        'You do not have access to this staff schedule',
      );
    }

    return this.appointmentsService.findAllByStaff(staffId);
  }

  private getUserIdFromRequest(req): number {
    const userId = Number(req?.user?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return userId;
  }

  private getRoleIdFromRequest(req): number {
    const roleId = Number(req?.user?.role_id);

    if (!Number.isInteger(roleId) || roleId <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return roleId;
  }
}
