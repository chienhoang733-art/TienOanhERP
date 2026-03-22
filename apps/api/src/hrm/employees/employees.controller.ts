import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@Controller('hrm/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @RequirePermissions('hrm:write')
  create(@Body() createData: any) {
    return this.employeesService.create(createData);
  }

  @Get()
  @RequirePermissions('hrm:read')
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('hrm:read')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('hrm:write')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.employeesService.update(+id, updateData);
  }

  @Delete(':id')
  @RequirePermissions('hrm:write')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
