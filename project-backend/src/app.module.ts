import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './appointments/appointments.module';
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
import { PsychiatristDashboardModule } from './psychiatrist-dashboard/psychiatrist-dashboard.module';
import { PsychologistDashboardModule } from './psychologist-dashboard/psychologist-dashboard.module';
import { StaffHomeModule } from './staff-home/staff-home.module';
import { PhamaHomeModule } from './phama-home/phama-home.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    LocationModule,
    QuestionnairesModule,
    QuestionsModule,
    ChoicesModule,
    AnswersModule,
    ResponsesModule,
    MailModule,
    AppointmentsModule,
    PharmacistModule,
    ConsultationsModule,
    PsychiatristDashboardModule,
    PsychologistDashboardModule,
    StaffHomeModule,
    PhamaHomeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
