import { User } from '../../domain/entities/User';
import { IAuthService } from '../../application/interfaces/IAuthService';

export class MockAuthService implements IAuthService {
    private loggedInUser: User | null;

    constructor(user?: User) {
        this.loggedInUser = user || new User('current-user-1', 'Test User', 'test@example.com', 'admin');
    }

    async getCurrentUser(): Promise<User | null> {
        return this.loggedInUser;
    }

    setLoggedInUser(user: User | null) {
        this.loggedInUser = user;
    }
}
