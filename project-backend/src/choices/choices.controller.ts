import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ChoicesService } from './choices.service';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';

@Controller('/questions/:questionId/choices')
export class ChoicesController {
  constructor(private readonly choicesService: ChoicesService) {}

  @Get()
  findAll(
    @Param('questionId',ParseIntPipe) questionId : number 
  ){
    return this.choicesService.findAll(questionId);
  }

  @Patch(':id')
  update(
    @Param('id',ParseIntPipe) id : number,
    @Body() dto: UpdateChoiceDto
  ){
    return this.choicesService.update(id,dto)
  }

  @Delete(':id')
  delete(
    @Param('id',ParseIntPipe) id : number,
  ){
    return this.choicesService.delete(id)
  }

  @Post()
  create(
   @Param('questionId',ParseIntPipe) questionId : number,
   @Body() dto:CreateChoiceDto
  ){
    console.log(questionId)
    console.log(dto)
    return this.choicesService.create(questionId,dto);
  }



}
