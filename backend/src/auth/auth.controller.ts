import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Public } from '../common/decorators/public.decorator';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import type { RefreshTokenPayload } from '../common/types/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

function requestContext(req: FastifyRequest) {
  return {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: FastifyRequest) {
    return this.authService.register(dto, requestContext(req));
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
    return this.authService.login(dto.email, dto.password, requestContext(req));
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Body() _dto: RefreshTokenDto, @Req() req: FastifyRequest) {
    const payload = req.user as RefreshTokenPayload & { refreshToken: string };
    return this.authService.refreshTokens(
      payload.sub,
      payload.username,
      payload.jti,
      payload.refreshToken,
      requestContext(req),
    );
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Body() _dto: RefreshTokenDto, @Req() req: FastifyRequest) {
    const payload = req.user as RefreshTokenPayload;
    await this.authService.logout(payload.jti);
    return { success: true };
  }
}
