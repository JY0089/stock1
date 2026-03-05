import { User } from '../../domain/entities/User';

export interface IAuthService {
    getCurrentUser(): Promise<User | null>;
}
