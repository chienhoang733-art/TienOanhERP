import { LeaveRequestsService } from './leave-requests.service';
export declare class LeaveRequestsController {
    private readonly leaveRequestsService;
    constructor(leaveRequestsService: LeaveRequestsService);
    create(createData: any): import(".prisma/client").Prisma.Prisma__LeaveRequestClient<{
        id: number;
        employeeId: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        employee: {
            id: number;
            fullName: string;
            email: string;
            position: string;
            departmentId: number;
        };
    } & {
        id: number;
        employeeId: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
    })[]>;
    findOne(id: string): Promise<{
        employee: {
            id: number;
            fullName: string;
            email: string;
            position: string;
            departmentId: number;
        };
    } & {
        id: number;
        employeeId: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
    }>;
    update(id: string, updateData: any): import(".prisma/client").Prisma.Prisma__LeaveRequestClient<{
        id: number;
        employeeId: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__LeaveRequestClient<{
        id: number;
        employeeId: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
