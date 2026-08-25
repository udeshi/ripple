import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('reports')
  listReports(@Query() query: ListReportsQueryDto) {
    return this.adminService.listReports(query, query.status);
  }

  @Post('reports/:id/resolve')
  resolveReport(@Param('id') id: string) {
    return this.adminService.resolveReport(id);
  }

  @Post('reports/:id/dismiss')
  dismissReport(@Param('id') id: string) {
    return this.adminService.dismissReport(id);
  }

  @Post('users/:username/ban')
  banUser(@Param('username') username: string) {
    return this.adminService.banUser(username);
  }

  @Post('users/:username/unban')
  unbanUser(@Param('username') username: string) {
    return this.adminService.unbanUser(username);
  }

  @Delete('posts/:id')
  removePost(@Param('id') id: string) {
    return this.adminService.removePost(id);
  }

  @Delete('comments/:id')
  removeComment(@Param('id') id: string) {
    return this.adminService.removeComment(id);
  }
}
