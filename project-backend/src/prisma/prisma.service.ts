import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly databaseConfigured = Boolean(process.env.DATABASE_URL);

  async onModuleInit() {
    if (!this.databaseConfigured) {
      return;
    }

    await this.$connect();
  }

  isDatabaseConfigured() {
    return this.databaseConfigured;
  }
}
