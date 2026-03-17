import { Module } from '@nestjs/common';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';

@Module({
  imports: [DepartmentsModule, EmployeesModule, LeaveRequestsModule]
})
export class HrmModule {}
