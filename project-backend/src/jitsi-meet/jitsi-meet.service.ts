import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

type CreateJitsiMeetInput = {
  roomName?: string;
  summary?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
};

@Injectable()
export class JitsiMeetService {
  async createMeet(input: CreateJitsiMeetInput) {
    const startDateTime = this.parseIsoDateTime(
      input.startDateTime,
      'startDateTime',
    );
    const endDateTime = this.parseIsoDateTime(input.endDateTime, 'endDateTime');

    if (endDateTime <= startDateTime) {
      throw new BadRequestException(
        'endDateTime must be later than startDateTime',
      );
    }

    const roomName = this.normalizeRoomName(
      input.roomName ||
        input.summary ||
        `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    );
    const baseUrl = (process.env.JITSI_BASE_URL || 'https://meet.jit.si').replace(
      /\/+$/,
      '',
    );
    const meetLink = `${baseUrl}/${roomName}`;

    return {
      message: 'Jitsi Meet link created successfully',
      roomName,
      meetLink,
      summary: input.summary?.trim() || null,
      description: input.description?.trim() || null,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
  }

  private parseIsoDateTime(value: string, fieldName: string) {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const parsed = new Date(normalized);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        `${fieldName} must be a valid ISO datetime`,
      );
    }

    return parsed;
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
