import { IPostRepository } from '../interfaces/IPostRepository';
import { Post } from '../../domain/entities/Post';
import { NotFoundError } from '../../domain/exceptions/errors';

export class GetPostUseCase {
    constructor(private postRepository: IPostRepository) { }

    async execute(id: string): Promise<Post> {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new NotFoundError(`Post with id ${id} not found.`);
        }
        return post;
    }
}

export class GetPostsUseCase {
    constructor(private postRepository: IPostRepository) { }

    async execute(options?: { authorId?: string; status?: string; limit?: number; offset?: number }): Promise<Post[]> {
        return this.postRepository.findAll(options);
    }
}
