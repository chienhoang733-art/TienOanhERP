import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.employee.findMany({
      include: { department: true, leaveRequests: true },
    });
  }

  async findOne(id: number) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { department: true, leaveRequests: true },
    });
    if (!emp) throw new NotFoundException(`Employee #${id} not found`);
    return emp;
  }

  create(data: Prisma.EmployeeUncheckedCreateInput) {
    return this.prisma.employee.create({ data });
  }

  update(id: number, data: Prisma.EmployeeUpdateInput) {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.employee.delete({ where: { id } });
  }
}
