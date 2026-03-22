import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class DepartmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<({
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
    findOne(id: number): Promise<{
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
    create(data: Prisma.DepartmentCreateInput): Prisma.Prisma__DepartmentClient<{
        name: string;
        id: number;
        managerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, data: Prisma.DepartmentUpdateInput): Prisma.Prisma__DepartmentClient<{
        name: string;
        id: number;
        managerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): Prisma.Prisma__DepartmentClient<{
        name: string;
        id: number;
        managerId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
