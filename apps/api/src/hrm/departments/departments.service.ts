import { Injectable, NotFoundException } from '@nestjs/common';

export interface Department {
  id: number;
  name: string;
  managerId?: number;
}

@Injectable()
export class DepartmentsService {
  private departments: Department[] = [
    { id: 1, name: 'Human Resources', managerId: 101 },
    { id: 2, name: 'Engineering', managerId: 102 },
    { id: 3, name: 'Sales', managerId: 103 },
  ];

  findAll() {
    return this.departments;
  }

  findOne(id: number) {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) throw new NotFoundException(`Department #${id} not found`);
    return dept;
  }

  create(data: Omit<Department, 'id'>) {
    const newDept = {
      id:
        this.departments.length > 0
          ? Math.max(...this.departments.map((d) => d.id)) + 1
          : 1,
      ...data,
    };
    this.departments.push(newDept);
    return newDept;
  }

  update(id: number, data: Partial<Department>) {
    const deptIndex = this.departments.findIndex((d) => d.id === id);
    if (deptIndex === -1)
      throw new NotFoundException(`Department #${id} not found`);
    const updated = { ...this.departments[deptIndex], ...data };
    this.departments[deptIndex] = updated;
    return updated;
  }

  remove(id: number) {
    const deptIndex = this.departments.findIndex((d) => d.id === id);
    if (deptIndex === -1)
      throw new NotFoundException(`Department #${id} not found`);
    const removed = this.departments[deptIndex];
    this.departments.splice(deptIndex, 1);
    return removed;
  }
}
