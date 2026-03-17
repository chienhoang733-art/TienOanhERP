import { EmployeesService } from './employees.service';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createData: any): {
        fullName: string;
        email: string;
        departmentId: number;
        position: string;
        id: number;
    };
    findAll(): import("./employees.service").Employee[];
    findOne(id: string): import("./employees.service").Employee;
    update(id: string, updateData: any): {
        id: number;
        fullName: string;
        email: string;
        departmentId: number;
        position: string;
    };
    remove(id: string): import("./employees.service").Employee;
}
