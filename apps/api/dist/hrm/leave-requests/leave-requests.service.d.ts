export interface LeaveRequest {
    id: number;
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export declare class LeaveRequestsService {
    private leaveRequests;
    findAll(): LeaveRequest[];
    findOne(id: number): LeaveRequest;
    create(data: Omit<LeaveRequest, 'id' | 'status'>): LeaveRequest;
    update(id: number, data: Partial<LeaveRequest>): {
        id: number;
        employeeId: number;
        startDate: string;
        endDate: string;
        reason: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
    };
    remove(id: number): LeaveRequest;
}
