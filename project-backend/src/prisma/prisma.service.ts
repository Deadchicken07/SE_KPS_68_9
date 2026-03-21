import { PrismaClient } from '@prisma/client';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly databaseConfigured = Boolean(process.env.DATABASE_URL);
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    if (!this.databaseConfigured) {
      this.logger.warn('DATABASE_URL is not configured; skipping database connection');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
    }
  }

  isDatabaseConfigured() {
    return this.databaseConfigured;
  }
}
