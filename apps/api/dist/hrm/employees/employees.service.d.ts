export interface Employee {
    id: number;
    fullName: string;
    email: string;
    departmentId: number;
    position: string;
}
export declare class EmployeesService {
    private employees;
    findAll(): Employee[];
    findOne(id: number): Employee;
    create(data: Omit<Employee, 'id'>): {
        fullName: string;
        email: string;
        departmentId: number;
        position: string;
        id: number;
    };
    update(id: number, data: Partial<Employee>): {
        id: number;
        fullName: string;
        email: string;
        departmentId: number;
        position: string;
    };
    remove(id: number): Employee;
}
