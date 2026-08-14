import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../common/types/jwt-payload.interface';
import { ListFlagsQueryDto } from './dto/list-flags-query.dto';
import { FlagsService } from './flags.service';

@Controller('flags')
export class FlagsController {
  constructor(private flagsService: FlagsService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  list(
    @Query() query: ListFlagsQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.flagsService.evaluateAll(user?.id ?? query.deviceId);
  }
}
