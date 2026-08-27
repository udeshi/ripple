import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/jwt-payload.interface';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('token')
  getToken(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.getToken(user.id);
  }

  @Post('channels')
  createChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateChannelDto,
  ) {
    if (dto.memberId === user.id) {
      throw new BadRequestException("Can't start a conversation with yourself");
    }
    return this.chatService.createDirectChannel(user.id, dto.memberId);
  }
}
