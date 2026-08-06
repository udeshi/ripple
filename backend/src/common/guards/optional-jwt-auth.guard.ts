import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../types/jwt-payload.interface';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T = AuthenticatedUser>(_err: unknown, user: T): T {
    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as Promise<boolean> | boolean;
  }
}
