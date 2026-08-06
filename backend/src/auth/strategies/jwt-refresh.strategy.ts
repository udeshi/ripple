import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/configuration';
import { RefreshTokenPayload } from '../../common/types/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.refreshSecret', { infer: true }),
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: RefreshTokenPayload) {
    const refreshToken = (req.body as { refreshToken?: string } | undefined)
      ?.refreshToken;
    return { ...payload, refreshToken };
  }
}
