import { DepartmentsService } from './departments.service';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createData: any): {
        name: string;
        managerId?: number | undefined;
        id: number;
    };
    findAll(): import("./departments.service").Department[];
    findOne(id: string): import("./departments.service").Department;
    update(id: string, updateData: any): {
        id: number;
        name: string;
        managerId?: number;
    };
    remove(id: string): import("./departments.service").Department;
}
