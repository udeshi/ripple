import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import ms, { StringValue } from 'ms';
import { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RequestContext {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto, context: RequestContext) {
    const user = await this.usersService.createUser(dto);
    const tokens = await this.issueTokenPair(user.id, user.username, context);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async login(email: string, password: string, context: RequestContext) {
    const user = await this.usersService.validatePassword(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.bannedAt) {
      throw new UnauthorizedException('This account has been suspended');
    }
    const tokens = await this.issueTokenPair(user.id, user.username, context);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async refreshTokens(
    userId: string,
    username: string,
    tokenId: string,
    presentedToken: string,
    context: RequestContext,
  ): Promise<TokenPair> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });

    if (
      !stored ||
      stored.userId !== userId ||
      stored.revokedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const matches = await bcrypt.compare(presentedToken, stored.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const newTokenId = randomUUID();
    const newRefreshToken = this.issueRefreshToken(
      userId,
      username,
      newTokenId,
    );
    const newTokenHash = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          id: newTokenId,
          userId,
          tokenHash: newTokenHash,
          expiresAt: this.expiresAtFrom('jwt.refreshExpiresIn'),
          userAgent: context.userAgent,
          ipAddress: context.ip,
        },
      }),
    ]);

    const accessToken = this.issueAccessToken(userId, username);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(tokenId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { id: tokenId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokenPair(
    userId: string,
    username: string,
    context: RequestContext,
  ): Promise<TokenPair> {
    const tokenId = randomUUID();
    const accessToken = this.issueAccessToken(userId, username);
    const refreshToken = this.issueRefreshToken(userId, username, tokenId);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId,
        tokenHash,
        expiresAt: this.expiresAtFrom('jwt.refreshExpiresIn'),
        userAgent: context.userAgent,
        ipAddress: context.ip,
      },
    });

    return { accessToken, refreshToken };
  }

  private issueAccessToken(userId: string, username: string): string {
    return this.jwtService.sign(
      { sub: userId, username },
      this.signOptions('jwt.accessSecret', 'jwt.accessExpiresIn'),
    );
  }

  private issueRefreshToken(
    userId: string,
    username: string,
    tokenId: string,
  ): string {
    return this.jwtService.sign(
      { sub: userId, username, jti: tokenId },
      this.signOptions('jwt.refreshSecret', 'jwt.refreshExpiresIn'),
    );
  }

  private signOptions(
    secretKey: 'jwt.accessSecret' | 'jwt.refreshSecret',
    expiresInKey: 'jwt.accessExpiresIn' | 'jwt.refreshExpiresIn',
  ): JwtSignOptions {
    return {
      secret: this.configService.get(secretKey, { infer: true }),
      expiresIn: this.configService.get(expiresInKey, {
        infer: true,
      }),
    };
  }

  private expiresAtFrom(
    key: 'jwt.accessExpiresIn' | 'jwt.refreshExpiresIn',
  ): Date {
    const duration = this.configService.get(key, { infer: true });
    return new Date(Date.now() + ms(duration as StringValue));
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }
}
