import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common'
import { ConversationsService } from './conversations.service'

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly convService: ConversationsService) {}

  @Get()
  findAll() {
    return this.convService.findAll()
  }

  @Post()
  create(@Body('modelId') modelId: string) {
    return this.convService.create(modelId)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.convService.delete(id)
    return { success: true }
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.convService.getMessages(id)
  }

  @Delete(':id/messages')
  clearMessages(@Param('id') id: string) {
    this.convService.clearMessages(id)
    return { success: true }
  }
}
