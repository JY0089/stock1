import { IPostRepository } from '../../application/interfaces/IPostRepository';
import { Post } from '../../domain/entities/Post';

export class InMemoryPostRepository implements IPostRepository {
    private posts: Map<string, Post> = new Map();

    async findById(id: string): Promise<Post | null> {
        const post = this.posts.get(id);
        return post || null;
    }

    async save(post: Post): Promise<void> {
        this.posts.set(post.id, post);
    }

    async delete(id: string): Promise<void> {
        this.posts.delete(id);
    }

    async countPostsByAuthorToday(authorId: string): Promise<number> {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let count = 0;
        for (const post of Array.from(this.posts.values())) {
            if (post.authorId === authorId && post.createdAt >= startOfToday) {
                count++;
            }
        }
        return count;
    }

    async findAll(options?: { authorId?: string; status?: string; limit?: number; offset?: number }): Promise<Post[]> {
        let result = Array.from(this.posts.values());

        if (options?.authorId) {
            result = result.filter(p => p.authorId === options.authorId);
        }
        if (options?.status) {
            result = result.filter(p => p.status === options.status);
        }

        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (options?.offset) {
            result = result.slice(options.offset);
        }
        if (options?.limit) {
            result = result.slice(0, options.limit);
        }

        return result;
    }
}
