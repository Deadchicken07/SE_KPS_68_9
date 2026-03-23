import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { MailModule } from './mail/mail.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { QuestionsModule } from './questions/questions.module';
import { ChoicesModule } from './choices/choices.module';
import { AnswersModule } from './answers/answers.module';
import { ResponsesModule } from './responses/responses.module';
import { PharmacistModule } from './pharmacist/pharmacist.module';
import { ConsultationsModule } from './consultations/consultations.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, LocationModule, QuestionnairesModule, QuestionsModule, ChoicesModule, AnswersModule, ResponsesModule,MailModule,PharmacistModule, ConsultationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
