import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class LeaveRequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<({
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
    findOne(id: number): Promise<{
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
    create(data: Omit<Prisma.LeaveRequestUncheckedCreateInput, 'startDate' | 'endDate'> & {
        startDate: string;
        endDate: string;
    }): Prisma.Prisma__LeaveRequestClient<{
        id: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, data: Partial<Omit<Prisma.LeaveRequestUpdateInput, 'startDate' | 'endDate'> & {
        startDate: string;
        endDate: string;
    }>): Prisma.Prisma__LeaveRequestClient<{
        id: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): Prisma.Prisma__LeaveRequestClient<{
        id: number;
        startDate: Date;
        endDate: Date;
        reason: string;
        status: string;
        employeeId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
