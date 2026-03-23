import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PhamaHomeService } from './phama-home.service';

@Controller('phama-home')
@UseGuards(JwtAuthGuard)
export class PhamaHomeController {
  constructor(private readonly phamaHomeService: PhamaHomeService) {}

  @Get('orders')
  getOrders(@Req() req) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.phamaHomeService.getOrders(auth.userId, auth.roleId);
  }

  @Patch('orders/:consultationId/status')
  updateOrderStatus(
    @Req() req,
    @Param('consultationId', ParseIntPipe) consultationId: number,
    @Body() body: { status?: string; tracking?: string },
  ) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.phamaHomeService.updateOrderStatus(
      consultationId,
      auth.userId,
      auth.roleId,
      body?.status,
      body?.tracking,
    );
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
