import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ModelsService, CreateModelDto } from './models.service'

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  findAll() {
    return this.modelsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateModelDto) {
    return this.modelsService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateModelDto>) {
    return this.modelsService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.modelsService.delete(id)
    return { success: true }
  }
}
