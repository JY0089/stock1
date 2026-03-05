import { IPostRepository } from '../interfaces/IPostRepository';
import { IAuthService } from '../interfaces/IAuthService';
import { Post } from '../../domain/entities/Post';
import { NotFoundError, UnauthorizedError, ApplicationError } from '../../domain/exceptions/errors';

export interface UpdatePostRequest {
    id: string;
    title?: string;
    content?: string;
}

export class UpdatePostUseCase {
    constructor(
        private postRepository: IPostRepository,
        private authService: IAuthService,
    ) { }

    async execute(request: UpdatePostRequest): Promise<Post> {
        const user = await this.authService.getCurrentUser();
        if (!user) {
            throw new UnauthorizedError('User must be logged in to update a post.');
        }

        const post = await this.postRepository.findById(request.id);
        if (!post) {
            throw new NotFoundError(`Post with id ${request.id} not found.`);
        }

        if (!post.canBeEditedBy(user.id, user.isAdmin())) {
            throw new UnauthorizedError('You do not have permission to edit this post.');
        }

        if (!post.isDraft()) {
            throw new ApplicationError('Only posts in draft status can be updated.', 400);
        }

        if (request.title) {
            post.setTitle(request.title);
        }
        if (request.content) {
            post.setContent(request.content);
        }

        await this.postRepository.save(post);
        return post;
    }
}
