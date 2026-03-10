import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { CreateChoiceDto } from 'src/choices/dto/create-choice.dto';
import { UpdateChoiceDto } from 'src/choices/dto/update-choice.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnswersService {
    constructor(private prisma : PrismaService){}
  
}
