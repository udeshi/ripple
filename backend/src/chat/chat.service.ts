import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamChat } from 'stream-chat';
import { AppConfig } from '../config/configuration';
import { UsersService } from '../users/users.service';

export interface ChatCredentials {
  apiKey: string;
  token: string;
  userId: string;
}

export interface DirectChannel {
  channelId: string;
  channelType: string;
}

@Injectable()
export class ChatService {
  private client: StreamChat | null = null;

  constructor(
    private configService: ConfigService<AppConfig, true>,
    private usersService: UsersService,
  ) {}

  async getToken(userId: string): Promise<ChatCredentials> {
    const client = this.getClient();
    await this.upsertStreamUser(userId);

    const token = client.createToken(userId);
    const apiKey = this.configService.get('stream.apiKey', { infer: true });
    return { apiKey, token, userId };
  }

  /**
   * Get or create the 1:1 "messaging" channel between two users.
   *
   * Stream only knows about a user once it's been upserted into its own
   * registry — which, until now, only happened when that user personally
   * opened the Chat tab and fetched a token. Starting a conversation with
   * someone who never has causes Stream to reject the channel with
   * "users ... don't exist". Doing the upsert here, server-side, right
   * before creating the channel closes that gap for every client (web,
   * mobile, and any future one) instead of requiring each to remember an
   * extra provisioning step.
   */
  async createDirectChannel(
    currentUserId: string,
    otherUserId: string,
  ): Promise<DirectChannel> {
    const client = this.getClient();
    await Promise.all([
      this.upsertStreamUser(currentUserId),
      this.upsertStreamUser(otherUserId),
    ]);

    const channel = client.channel('messaging', {
      members: [currentUserId, otherUserId],
      created_by_id: currentUserId,
    });
    await channel.create();

    return { channelId: channel.id!, channelType: channel.type };
  }

  private async upsertStreamUser(userId: string): Promise<void> {
    const client = this.getClient();
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await client.upsertUser({
      id: user.id,
      name: user.displayName ?? user.username,
      image: user.avatarUrl ?? undefined,
    });
  }

  private getClient(): StreamChat {
    if (this.client) return this.client;

    const apiKey = this.configService.get('stream.apiKey', { infer: true });
    const apiSecret = this.configService.get('stream.apiSecret', {
      infer: true,
    });
    if (!apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Chat is not configured (missing STREAM_API_KEY/STREAM_API_SECRET)',
      );
    }

    this.client = StreamChat.getInstance(apiKey, apiSecret);
    return this.client;
  }
}
