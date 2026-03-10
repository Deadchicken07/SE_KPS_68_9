import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user-query.dto';

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
}
