import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🚀 Successfully connected to Neon Database!');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Neon Database', error);
    }
  }
}
