import { LeaveRequestsService } from './leave-requests.service';
export declare class LeaveRequestsController {
    private readonly leaveRequestsService;
    constructor(leaveRequestsService: LeaveRequestsService);
    create(createData: any): import(".prisma/client").Prisma.Prisma__LeaveRequestClient<{
        id: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
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
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
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
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
    }>;
    update(id: string, updateData: any): import(".prisma/client").Prisma.Prisma__LeaveRequestClient<{
        id: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__LeaveRequestClient<{
        id: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
