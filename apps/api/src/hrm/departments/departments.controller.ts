import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@Controller('hrm/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermissions('hrm:write')
  create(@Body() createData: any) {
    return this.departmentsService.create(createData);
  }

  @Get()
  @RequirePermissions('hrm:read')
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('hrm:read')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('hrm:write')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.departmentsService.update(+id, updateData);
  }

  @Delete(':id')
  @RequirePermissions('hrm:write')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
