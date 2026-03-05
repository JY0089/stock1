import { IPostRepository } from '../interfaces/IPostRepository';
import { IAuthService } from '../interfaces/IAuthService';
import { Post } from '../../domain/entities/Post';
import { LimitExceededError, UnauthorizedError } from '../../domain/exceptions/errors';

export interface CreatePostRequest {
    title: string;
    content: string;
}

export class CreatePostUseCase {
    constructor(
        private postRepository: IPostRepository,
        private authService: IAuthService,
    ) { }

    async execute(request: CreatePostRequest): Promise<Post> {
        const user = await this.authService.getCurrentUser();

        if (!user) {
            throw new UnauthorizedError('User must be logged in to create a post.');
        }

        const todayCount = await this.postRepository.countPostsByAuthorToday(user.id);
        if (todayCount >= 10) {
            throw new LimitExceededError('You can only create up to 10 posts per day.');
        }

        const post = new Post({
            id: crypto.randomUUID(), // Assume standard crypto for now or ID generation service
            authorId: user.id,
            title: request.title,
            content: request.content,
        });

        await this.postRepository.save(post);
        return post;
    }
}
