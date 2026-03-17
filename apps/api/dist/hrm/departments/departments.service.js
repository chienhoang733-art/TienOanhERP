"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
let DepartmentsService = class DepartmentsService {
    departments = [
        { id: 1, name: 'Human Resources', managerId: 101 },
        { id: 2, name: 'Engineering', managerId: 102 },
        { id: 3, name: 'Sales', managerId: 103 },
    ];
    findAll() {
        return this.departments;
    }
    findOne(id) {
        const dept = this.departments.find((d) => d.id === id);
        if (!dept)
            throw new common_1.NotFoundException(`Department #${id} not found`);
        return dept;
    }
    create(data) {
        const newDept = {
            id: this.departments.length > 0
                ? Math.max(...this.departments.map((d) => d.id)) + 1
                : 1,
            ...data,
        };
        this.departments.push(newDept);
        return newDept;
    }
    update(id, data) {
        const deptIndex = this.departments.findIndex((d) => d.id === id);
        if (deptIndex === -1)
            throw new common_1.NotFoundException(`Department #${id} not found`);
        const updated = { ...this.departments[deptIndex], ...data };
        this.departments[deptIndex] = updated;
        return updated;
    }
    remove(id) {
        const deptIndex = this.departments.findIndex((d) => d.id === id);
        if (deptIndex === -1)
            throw new common_1.NotFoundException(`Department #${id} not found`);
        const removed = this.departments[deptIndex];
        this.departments.splice(deptIndex, 1);
        return removed;
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)()
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map