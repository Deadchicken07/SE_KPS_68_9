import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('staff')
  findStaffs() {
    return this.userService.findStaffs();
  }

  @Get('all')
  findUser() {
    return this.userService.findAllUser();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@Req() req) {
    return this.userService.getMyProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.userService.updateMyProfile(req.user.sub, body);
  }

  @Get('staff/:id')
  async findStaffById(@Param('id') id: string) {
    return this.userService.findStaffById(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
  
  @Get('by-nation/:nationId')
  findByNation(
    @Param('nationId') nationId: string,
    @Query('name') name: string,
    @Query('surName') surName: string,
  ) {
    return this.userService.findByNationId(nationId, name, surName);
  }
  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    return this.userService.checkEmail(email);
  }

  @Post('staff')
  async createStaff(@Body() body: CreateStaffDto) {
    return this.userService.createStaff(body);
  }
}
