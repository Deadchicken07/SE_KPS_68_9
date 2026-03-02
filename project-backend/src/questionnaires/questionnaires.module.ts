import { Module } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionnairesController],
  providers: [QuestionnairesService],
})
export class QuestionnairesModule {}
