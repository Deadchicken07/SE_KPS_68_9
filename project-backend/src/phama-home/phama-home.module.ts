import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PhamaHomeController } from './phama-home.controller';
import { PhamaHomeService } from './phama-home.service';

@Module({
  imports: [PrismaModule],
  controllers: [PhamaHomeController],
  providers: [PhamaHomeService],
})
export class PhamaHomeModule {}
