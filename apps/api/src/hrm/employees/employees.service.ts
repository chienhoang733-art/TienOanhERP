import { Injectable, NotFoundException } from '@nestjs/common';

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  departmentId: number;
  position: string;
}

@Injectable()
export class EmployeesService {
  private employees: Employee[] = [
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@tienoanh.com',
      departmentId: 1,
      position: 'HR Manager',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane.smith@tienoanh.com',
      departmentId: 2,
      position: 'Software Engineer',
    },
    {
      id: 3,
      fullName: 'Alice Johnson',
      email: 'alice.j@tienoanh.com',
      departmentId: 3,
      position: 'Sales Representative',
    },
  ];

  findAll() {
    return this.employees;
  }

  findOne(id: number) {
    const employee = this.employees.find((e) => e.id === id);
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return employee;
  }

  create(data: Omit<Employee, 'id'>) {
    const newEmployee = {
      id:
        this.employees.length > 0
          ? Math.max(...this.employees.map((e) => e.id)) + 1
          : 1,
      ...data,
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  update(id: number, data: Partial<Employee>) {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundException(`Employee #${id} not found`);
    const updated = { ...this.employees[index], ...data };
    this.employees[index] = updated;
    return updated;
  }

  remove(id: number) {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundException(`Employee #${id} not found`);
    const removed = this.employees[index];
    this.employees.splice(index, 1);
    return removed;
  }
}
