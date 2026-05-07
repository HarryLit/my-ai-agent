import { Controller, Post, Query, Body, Res, Req } from '@nestjs/common'
import { Request, Response } from 'express'
import { ChatService } from './chat.service'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async send(
    @Query('conversationId') conversationId: string,
    @Body('content') content: string,
    @Body('modelId') modelId: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const subscription = this.chatService.sendMessage(conversationId, content, modelId).subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      },
      error: (err) => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
        res.end()
      },
      complete: () => {
        res.end()
      }
    })

    req.on('close', () => {
      subscription.unsubscribe()
    })
  }
}
