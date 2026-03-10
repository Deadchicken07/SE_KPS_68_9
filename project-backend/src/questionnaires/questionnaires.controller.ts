import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { questionnaires_type_enum } from '@prisma/client';

@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Get()
  findAll(){
    return this.questionnairesService.findAll();
  }

  @Get('status/:status')
  findStatusAll(@Param('status') status: string){
    return this.questionnairesService.findStatus(status as questionnaires_type_enum);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number){
    return this.questionnairesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id',ParseIntPipe) id : number,
    @Body() body: UpdateQuestionnaireDto,
  ){
    return this.questionnairesService.update(id,body);
  }

  @Post()
  create(@Body() body:CreateQuestionnaireDto){
    return this.questionnairesService.create(body);
  }


  @Delete(':id')
  deleteOne(@Param('id',ParseIntPipe) id: number){
    return this.questionnairesService.delete(id);
  }
}
