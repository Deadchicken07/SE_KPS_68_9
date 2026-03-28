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
import { StaffHomeModule } from './staff-home/staff-home.module';
import { PhamaHomeModule } from './phama-home/phama-home.module';
import { ResponsesModule } from './responses/responses.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PharmacistModule } from './pharmacist/pharmacist.module';
import { JitsiMeetModule } from './jitsi-meet/jitsi-meet.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    LocationModule,
    QuestionnairesModule,
    MailModule,
    QuestionsModule,
    ChoicesModule,
    AnswersModule,
    AppointmentsModule,
    StaffHomeModule,
    PhamaHomeModule,
    ResponsesModule,
    ConsultationsModule,
    PharmacistModule,
    JitsiMeetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
