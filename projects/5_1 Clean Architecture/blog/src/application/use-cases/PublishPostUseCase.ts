import { IPostRepository } from '../interfaces/IPostRepository';
import { IAuthService } from '../interfaces/IAuthService';
import { Post } from '../../domain/entities/Post';
import { NotFoundError, UnauthorizedError } from '../../domain/exceptions/errors';

export class PublishPostUseCase {
    constructor(
        private postRepository: IPostRepository,
        private authService: IAuthService,
    ) { }

    async execute(id: string): Promise<Post> {
        const user = await this.authService.getCurrentUser();
        if (!user) {
            throw new UnauthorizedError('User must be logged in to publish a post.');
        }

        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new NotFoundError(`Post with id ${id} not found.`);
        }

        if (!post.canBeEditedBy(user.id, user.isAdmin())) {
            throw new UnauthorizedError('You do not have permission to publish this post.');
        }

        post.publish();

        await this.postRepository.save(post);
        return post;
    }
}
