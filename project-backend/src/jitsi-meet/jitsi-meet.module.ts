import { Module } from '@nestjs/common';
import { JitsiMeetController } from './jitsi-meet.controller';
import { JitsiMeetService } from './jitsi-meet.service';

@Module({
  controllers: [JitsiMeetController],
  providers: [JitsiMeetService],
})
export class JitsiMeetModule {}
