"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
let EmployeesService = class EmployeesService {
    employees = [
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
    findOne(id) {
        const employee = this.employees.find((e) => e.id === id);
        if (!employee)
            throw new common_1.NotFoundException(`Employee #${id} not found`);
        return employee;
    }
    create(data) {
        const newEmployee = {
            id: this.employees.length > 0
                ? Math.max(...this.employees.map((e) => e.id)) + 1
                : 1,
            ...data,
        };
        this.employees.push(newEmployee);
        return newEmployee;
    }
    update(id, data) {
        const index = this.employees.findIndex((e) => e.id === id);
        if (index === -1)
            throw new common_1.NotFoundException(`Employee #${id} not found`);
        const updated = { ...this.employees[index], ...data };
        this.employees[index] = updated;
        return updated;
    }
    remove(id) {
        const index = this.employees.findIndex((e) => e.id === id);
        if (index === -1)
            throw new common_1.NotFoundException(`Employee #${id} not found`);
        const removed = this.employees[index];
        this.employees.splice(index, 1);
        return removed;
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)()
], EmployeesService);
//# sourceMappingURL=employees.service.js.map