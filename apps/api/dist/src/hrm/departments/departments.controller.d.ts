import { DepartmentsService } from './departments.service';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createData: any): import(".prisma/client").Prisma.Prisma__DepartmentClient<{
        name: string;
        id: number;
        managerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        employees: {
            id: number;
            fullName: string;
            email: string;
            position: string;
            departmentId: number;
        }[];
    } & {
        name: string;
        id: number;
        managerId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        employees: {
            id: number;
            fullName: string;
            email: string;
            position: string;
            departmentId: number;
        }[];
    } & {
        name: string;
        id: number;
        managerId: number | null;
    }>;
    update(id: string, updateData: any): import(".prisma/client").Prisma.Prisma__DepartmentClient<{
        name: string;
        id: number;
        managerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__DepartmentClient<{
        name: string;
        id: number;
        managerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
