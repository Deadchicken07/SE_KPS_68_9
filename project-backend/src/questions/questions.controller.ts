import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PaginationQueryDto } from './dto/pagination-question.dto';

@Controller('questionnaires/:questionnaireId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}
  
  @Get()
  findAll(
    @Param('questionnaireId',ParseIntPipe) questionnaireId : number,
    @Query() dto: PaginationQueryDto
  ){
    return this.questionsService.findAll(questionnaireId,dto);
  }

  @Get(':id')
  findOne(
    @Param('questionnaireId',ParseIntPipe) questionnaireId : number,
    @Param('id',ParseIntPipe) id : number
  ){
    return this.questionsService.findOne(questionnaireId,id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto
  ) {
    return this.questionsService.update(id, dto);
  }

  @Post()
  create(
    @Param('questionnaireId',ParseIntPipe) questionnaireId : number,
    @Body() dto:CreateQuestionDto
  ){
    return this.questionsService.create(questionnaireId,dto);
  }
}
