import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@Controller('hrm/leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
  @RequirePermissions('hrm:write')
  create(@Body() createData: any) {
    return this.leaveRequestsService.create(createData);
  }

  @Get()
  @RequirePermissions('hrm:read')
  findAll() {
    return this.leaveRequestsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('hrm:read')
  findOne(@Param('id') id: string) {
    return this.leaveRequestsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('hrm:write')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.leaveRequestsService.update(+id, updateData);
  }

  @Delete(':id')
  @RequirePermissions('hrm:write')
  remove(@Param('id') id: string) {
    return this.leaveRequestsService.remove(+id);
  }
}
