import { InMemoryPostRepository } from '../../infrastructure/repositories/InMemoryPostRepository';
import { MockAuthService } from '../../infrastructure/auth/MockAuthService';
import { CreatePostUseCase } from '../../application/use-cases/CreatePostUseCase';
import { UpdatePostUseCase } from '../../application/use-cases/UpdatePostUseCase';
import { PublishPostUseCase } from '../../application/use-cases/PublishPostUseCase';
import { DeletePostUseCase } from '../../application/use-cases/DeletePostUseCase';
import { GetPostUseCase, GetPostsUseCase } from '../../application/use-cases/GetPostUseCases';

// Singleton instances for the mock database and services to persist data during the node process life
const postRepository = new InMemoryPostRepository();
const authService = new MockAuthService();

export const diContainer = {
    createPostUseCase: new CreatePostUseCase(postRepository, authService),
    updatePostUseCase: new UpdatePostUseCase(postRepository, authService),
    publishPostUseCase: new PublishPostUseCase(postRepository, authService),
    deletePostUseCase: new DeletePostUseCase(postRepository, authService),
    getPostUseCase: new GetPostUseCase(postRepository),
    getPostsUseCase: new GetPostsUseCase(postRepository),

    // Expose these for testing/mocking UI easily
    authService,
};
