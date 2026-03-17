import { Injectable, NotFoundException } from '@nestjs/common';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

@Injectable()
export class LeaveRequestsService {
  private leaveRequests: LeaveRequest[] = [
    {
      id: 1,
      employeeId: 2,
      startDate: '2026-03-20',
      endDate: '2026-03-21',
      reason: 'Personal trip',
      status: 'APPROVED',
    },
    {
      id: 2,
      employeeId: 3,
      startDate: '2026-04-01',
      endDate: '2026-04-05',
      reason: 'Sick leave',
      status: 'PENDING',
    },
  ];

  findAll() {
    return this.leaveRequests;
  }

  findOne(id: number) {
    const leaveRequest = this.leaveRequests.find((l) => l.id === id);
    if (!leaveRequest)
      throw new NotFoundException(`LeaveRequest #${id} not found`);
    return leaveRequest;
  }

  create(data: Omit<LeaveRequest, 'id' | 'status'>) {
    const newRequest: LeaveRequest = {
      id:
        this.leaveRequests.length > 0
          ? Math.max(...this.leaveRequests.map((l) => l.id)) + 1
          : 1,
      status: 'PENDING',
      ...data,
    };
    this.leaveRequests.push(newRequest);
    return newRequest;
  }

  update(id: number, data: Partial<LeaveRequest>) {
    const index = this.leaveRequests.findIndex((l) => l.id === id);
    if (index === -1)
      throw new NotFoundException(`LeaveRequest #${id} not found`);
    const updated = { ...this.leaveRequests[index], ...data };
    this.leaveRequests[index] = updated;
    return updated;
  }

  remove(id: number) {
    const index = this.leaveRequests.findIndex((l) => l.id === id);
    if (index === -1)
      throw new NotFoundException(`LeaveRequest #${id} not found`);
    const removed = this.leaveRequests[index];
    this.leaveRequests.splice(index, 1);
    return removed;
  }
}
