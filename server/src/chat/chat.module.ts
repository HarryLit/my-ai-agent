import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatLogger } from './chat-logger.service'
import { ConversationsModule } from '../conversations/conversations.module'
import { ModelsModule } from '../models/models.module'

@Module({
  imports: [ConversationsModule, ModelsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatLogger]
})
export class ChatModule {}
