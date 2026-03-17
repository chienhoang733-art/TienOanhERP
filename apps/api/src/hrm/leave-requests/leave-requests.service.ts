import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.leaveRequest.findMany({ include: { employee: true } });
  }

  async findOne(id: number) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!leaveRequest)
      throw new NotFoundException(`LeaveRequest #${id} not found`);
    return leaveRequest;
  }

  create(data: Omit<Prisma.LeaveRequestUncheckedCreateInput, 'startDate' | 'endDate'> & { startDate: string, endDate: string }) {
    return this.prisma.leaveRequest.create({ 
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      } 
    });
  }

  update(id: number, data: Partial<Omit<Prisma.LeaveRequestUpdateInput, 'startDate' | 'endDate'> & { startDate: string, endDate: string }>) {
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    
    return this.prisma.leaveRequest.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: number) {
    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
