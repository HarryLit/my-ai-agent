import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ModelsModule } from './models/models.module'
import { ConversationsModule } from './conversations/conversations.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [DatabaseModule, ModelsModule, ConversationsModule, ChatModule]
})
export class AppModule {}
