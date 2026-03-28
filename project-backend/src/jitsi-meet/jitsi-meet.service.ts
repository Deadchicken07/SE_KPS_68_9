import { BadRequestException, Injectable } from '@nestjs/common';

type CreateJitsiMeetInput = {
  roomName?: string;
};

@Injectable()
export class JitsiMeetService {
  async createMeet(input: CreateJitsiMeetInput) {
    const roomName = this.normalizeRoomName(
      input.roomName ||
        `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    );
    const baseUrl = (
      process.env.JITSI_BASE_URL || 'https://meet.jit.si'
    ).replace(/\/+$/, '');
    const meetLink = `${baseUrl}/${roomName}`;

    return {
      message: 'Jitsi Meet link created successfully',
      roomName,
      meetLink,
    };
  }

  private normalizeRoomName(value: string) {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_ ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!normalized) {
      throw new BadRequestException('roomName is invalid');
    }

    return normalized;
  }
}
