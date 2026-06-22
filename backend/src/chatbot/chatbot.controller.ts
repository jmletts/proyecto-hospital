import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/chat.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() chatDto: ChatDto) {
    const response = await this.chatbotService.generateResponse(
      chatDto.mensaje,
      chatDto.history
    );
    return {
      respuesta: response,
    };
  }
}
