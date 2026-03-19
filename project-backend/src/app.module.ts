import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PsychiatristDashboardModule } from './psychiatrist-dashboard/psychiatrist-dashboard.module';
import { PsychologistDashboardModule } from './psychologist-dashboard/psychologist-dashboard.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    PsychiatristDashboardModule,
    PsychologistDashboardModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
