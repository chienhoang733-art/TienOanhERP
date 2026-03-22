import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: number;
        username: string;
        email: string;
        role: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            username: string;
            email: string;
            role: string;
            permissions: string[];
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: number): Promise<{
        message: string;
    }>;
    getMe(userId: number): Promise<{
        id: number;
        username: string;
        email: string;
        role: {
            id: number;
            slug: string;
            name: string;
        };
        permissions: string[];
        employee: {
            id: number;
            fullName: string;
            email: string;
            position: string;
            departmentId: number;
        } | null;
    }>;
    changePassword(userId: number, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
