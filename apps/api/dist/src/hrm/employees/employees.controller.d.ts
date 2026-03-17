import { EmployeesService } from './employees.service';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createData: any): import(".prisma/client").Prisma.Prisma__EmployeeClient<{
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        department: {
            name: string;
            managerId: number | null;
            id: number;
        };
        leaveRequests: {
            id: number;
            startDate: Date;
            endDate: Date;
            reason: string;
            status: string;
            employeeId: number;
        }[];
    } & {
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    })[]>;
    findOne(id: string): Promise<{
        department: {
            name: string;
            managerId: number | null;
            id: number;
        };
        leaveRequests: {
            id: number;
            startDate: Date;
            endDate: Date;
            reason: string;
            status: string;
            employeeId: number;
        }[];
    } & {
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }>;
    update(id: string, updateData: any): import(".prisma/client").Prisma.Prisma__EmployeeClient<{
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__EmployeeClient<{
        id: number;
        fullName: string;
        email: string;
        position: string;
        departmentId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
