import { User } from '../../domain/entities/User';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}
