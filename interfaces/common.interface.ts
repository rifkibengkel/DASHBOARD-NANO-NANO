export interface ISession {
    id: string
    username: string;
    email?: string;
    name: string;
    emp: number;
    fullname: string;
    password?: string;
    accessId: number;
    // promoId?: number;
    role: string;
    employee_id: string
    employeeId: string | null
    createdAt?: number;
    maxAge?: number;
}