export interface Department {
    id: number;
    name: string;
    managerId?: number;
}
export declare class DepartmentsService {
    private departments;
    findAll(): Department[];
    findOne(id: number): Department;
    create(data: Omit<Department, 'id'>): {
        name: string;
        managerId?: number | undefined;
        id: number;
    };
    update(id: number, data: Partial<Department>): {
        id: number;
        name: string;
        managerId?: number;
    };
    remove(id: number): Department;
}
