import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, LocationModule, QuestionnairesModule, QuestionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
