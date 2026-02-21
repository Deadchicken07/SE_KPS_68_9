import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user-query.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
