import { LeaveRequestsService } from './leave-requests.service';
export declare class LeaveRequestsController {
    private readonly leaveRequestsService;
    constructor(leaveRequestsService: LeaveRequestsService);
    create(createData: any): import("./leave-requests.service").LeaveRequest;
    findAll(): import("./leave-requests.service").LeaveRequest[];
    findOne(id: string): import("./leave-requests.service").LeaveRequest;
    update(id: string, updateData: any): {
        id: number;
        employeeId: number;
        startDate: string;
        endDate: string;
        reason: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
    };
    remove(id: string): import("./leave-requests.service").LeaveRequest;
}
