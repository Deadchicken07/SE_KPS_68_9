import { Body, Controller, Post } from '@nestjs/common';
import { JitsiMeetService } from './jitsi-meet.service';

type CreateJitsiMeetBody = {
  roomName?: string;
};

@Controller('jitsi-meet')
export class JitsiMeetController {
  constructor(private readonly jitsiMeetService: JitsiMeetService) {}

  @Post('create')
  create(@Body() body: CreateJitsiMeetBody) {
    return this.jitsiMeetService.createMeet(body);
  }
}
