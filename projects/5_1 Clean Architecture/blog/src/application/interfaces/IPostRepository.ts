import { Post } from '../../domain/entities/Post';

export interface IPostRepository {
    findById(id: string): Promise<Post | null>;
    save(post: Post): Promise<void>;
    delete(id: string): Promise<void>;
    countPostsByAuthorToday(authorId: string): Promise<number>;
    findAll(options?: { authorId?: string; status?: string; limit?: number; offset?: number }): Promise<Post[]>;
}
