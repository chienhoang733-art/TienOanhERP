import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class EmployeesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<({
        department: {
            name: string;
            id: number;
            managerId: number | null;
        };
        leaveRequests: {
            id: number;
            employeeId: number;
            startDate: Date;
            endDate: Date;
            reason: string;
            status: string;
        }[];
    } & {
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    })[]>;
    findOne(id: number): Promise<{
        department: {
            name: string;
            id: number;
            managerId: number | null;
        };
        leaveRequests: {
            id: number;
            employeeId: number;
            startDate: Date;
            endDate: Date;
            reason: string;
            status: string;
        }[];
    } & {
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }>;
    create(data: Prisma.EmployeeUncheckedCreateInput): Prisma.Prisma__EmployeeClient<{
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, data: Prisma.EmployeeUpdateInput): Prisma.Prisma__EmployeeClient<{
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): Prisma.Prisma__EmployeeClient<{
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
