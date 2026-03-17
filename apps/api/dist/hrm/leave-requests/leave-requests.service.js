"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestsService = void 0;
const common_1 = require("@nestjs/common");
let LeaveRequestsService = class LeaveRequestsService {
    leaveRequests = [
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
    findOne(id) {
        const leaveRequest = this.leaveRequests.find((l) => l.id === id);
        if (!leaveRequest)
            throw new common_1.NotFoundException(`LeaveRequest #${id} not found`);
        return leaveRequest;
    }
    create(data) {
        const newRequest = {
            id: this.leaveRequests.length > 0
                ? Math.max(...this.leaveRequests.map((l) => l.id)) + 1
                : 1,
            status: 'PENDING',
            ...data,
        };
        this.leaveRequests.push(newRequest);
        return newRequest;
    }
    update(id, data) {
        const index = this.leaveRequests.findIndex((l) => l.id === id);
        if (index === -1)
            throw new common_1.NotFoundException(`LeaveRequest #${id} not found`);
        const updated = { ...this.leaveRequests[index], ...data };
        this.leaveRequests[index] = updated;
        return updated;
    }
    remove(id) {
        const index = this.leaveRequests.findIndex((l) => l.id === id);
        if (index === -1)
            throw new common_1.NotFoundException(`LeaveRequest #${id} not found`);
        const removed = this.leaveRequests[index];
        this.leaveRequests.splice(index, 1);
        return removed;
    }
};
exports.LeaveRequestsService = LeaveRequestsService;
exports.LeaveRequestsService = LeaveRequestsService = __decorate([
    (0, common_1.Injectable)()
], LeaveRequestsService);
//# sourceMappingURL=leave-requests.service.js.map