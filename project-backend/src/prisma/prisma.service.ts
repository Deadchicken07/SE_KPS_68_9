import { Prisma, PrismaClient } from '@prisma/client';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly databaseConfigured = Boolean(process.env.DATABASE_URL);
  private isRefreshingConnection = false;

  constructor() {
    super({
      datasources: {
        db: {
          url: PrismaService.buildDatabaseUrl(process.env.DATABASE_URL),
        },
      },
    });

    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error) {
        if (!this.shouldRefreshConnection(error)) {
          throw error;
        }

        await this.refreshConnection();
        return next(params);
      }
    });
  }

  async onModuleInit() {
    if (!this.databaseConfigured) {
      this.logger.warn('DATABASE_URL is not configured; skipping database connection');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private static buildDatabaseUrl(databaseUrl?: string) {
    if (!databaseUrl) {
      return databaseUrl;
    }

    const normalized = new URL(databaseUrl);

    if (normalized.hostname.includes('-pooler.')) {
      normalized.searchParams.set('pgbouncer', 'true');
      normalized.searchParams.set('connect_timeout', '15');
    }

    return normalized.toString();
  }

  private shouldRefreshConnection(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientUnknownRequestError &&
      error.message.includes('cached plan must not change result type')
    );
  }

  private async refreshConnection() {
    if (this.isRefreshingConnection) {
      return;
    }

    this.isRefreshingConnection = true;

    try {
      this.logger.warn('Refreshing Prisma connection after cached-plan error');
      await this.$disconnect();
      await this.$connect();
    } finally {
      this.isRefreshingConnection = false;
    }
  }

  isDatabaseConfigured() {
    return this.databaseConfigured;
  }
}
